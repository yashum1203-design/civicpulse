/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AIProcessingHubModal } from './components/citizen/AIProcessingHubModal';
import { INITIAL_ISSUES, CATEGORY_METADATA } from './data/mockIssues';
import { CivicIssue, DuplicateCheckResult, CivicCategory, BaselineGisData } from './types';
import { 
  checkForDuplicate, 
  calculateUrgencyScore, 
  getSeverityTier,
  encodeTextEmbedding 
} from './utils/civicPulseAlgorithms';
import { 
  reverseGeocodeGps, 
  searchLocationGps, 
  generateSurroundingsIssues 
} from './utils/surroundingsGenerator';
import { Truck } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'citizen' | 'admin'>('citizen');
  const [issues, setIssues] = useState<CivicIssue[]>(INITIAL_ISSUES);

  // Real GPS & Local Surroundings State
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>(
    'Peenya Industrial Corridor, Bangalore'
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // AI Processing Hub Simulation Modal State
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [createdIssue, setCreatedIssue] = useState<CivicIssue | null>(null);

  // Live Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Trigger GPS detection and load surrounding issues
  const handleTriggerGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    showToast('Connecting to satellite GPS network...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserGps({ lat, lng });

        // Reverse geocode to find street & neighborhood
        const gisInfo = await reverseGeocodeGps(lat, lng);
        setLocationAddress(gisInfo.address);

        // Generate realistic localized issues around this GPS coordinate
        const localIssues = generateSurroundingsIssues(lat, lng, gisInfo);
        setIssues(localIssues);

        setIsLocating(false);
        showToast(`📍 GPS Locked! Loaded ${localIssues.length} active civic issues around ${gisInfo.roadName}.`);
      },
      async (error) => {
        // Fallback default coordinate (e.g. Yeshwanthpur/Peenya Metro)
        console.warn('Geolocation unavailable or denied:', error.message);
        const fallbackLat = 13.0285;
        const fallbackLng = 77.5450;
        setUserGps({ lat: fallbackLat, lng: fallbackLng });

        const gisInfo = await reverseGeocodeGps(fallbackLat, fallbackLng);
        setLocationAddress(gisInfo.address);
        const localIssues = generateSurroundingsIssues(fallbackLat, fallbackLng, gisInfo);
        setIssues(localIssues);

        setIsLocating(false);
        showToast('GPS simulated for Bangalore Metro area. Detected 5 surrounding issues.');
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Search any city/neighborhood and generate surroundings
  const handleSearchCity = async (query: string) => {
    setIsLocating(true);
    showToast(`Searching location for "${query}"...`);
    const result = await searchLocationGps(query);
    if (result) {
      setUserGps({ lat: result.lat, lng: result.lon });
      const gisInfo = await reverseGeocodeGps(result.lat, result.lon);
      setLocationAddress(result.displayName);
      const localIssues = generateSurroundingsIssues(result.lat, result.lon, gisInfo);
      setIssues(localIssues);
      setIsLocating(false);
      showToast(`📍 Relocated to ${result.displayName}. Loaded ${localIssues.length} nearby civic issues.`);
    } else {
      setIsLocating(false);
      showToast(`Location "${query}" not found. Please try another search.`);
    }
  };

  // Submit issue flow from Citizen Portal executing definitive Python backend logic
  const handleSubmitIssue = (issueData: {
    category: CivicCategory;
    title: string;
    description: string;
    locationName: string;
    latitude: number;
    longitude: number;
    baseline_data: BaselineGisData;
  }) => {
    // 1. Run check_for_duplicate(new_description, new_location, distance_threshold_meters=50.0, similarity_threshold=0.75)
    const dupCheck = checkForDuplicate(
      issueData.description,
      [issueData.latitude, issueData.longitude],
      issues,
      50.0,
      0.75
    );

    if (dupCheck.isDuplicate && dupCheck.matchedIssue) {
      // Duplicate Linked! Elevate report impact count
      const updatedImpact = dupCheck.matchedIssue.impact_count + 1;
      const updatedMatchedIssue: CivicIssue = {
        ...dupCheck.matchedIssue,
        impact_count: updatedImpact
      };

      setIssues((prev) =>
        prev.map((i) => (i.id === updatedMatchedIssue.id ? updatedMatchedIssue : i))
      );

      setDuplicateResult({
        ...dupCheck,
        matchedIssue: updatedMatchedIssue
      });
      setCreatedIssue(null);
    } else {
      // Approved Unique Issue! Run calculate_urgency_score & getSeverityTier
      const nextNum = issues.length + 1;
      const newId = `TICKET_${String(nextNum).padStart(3, '0')}`;
      const urgencyScore = calculateUrgencyScore(
        issueData.category,
        [issueData.latitude, issueData.longitude],
        issueData.baseline_data
      );
      const severityTier = getSeverityTier(urgencyScore);

      const newIssue: CivicIssue = {
        id: newId,
        category: issueData.category,
        title: issueData.title,
        description: issueData.description,
        location: [issueData.latitude, issueData.longitude],
        latitude: issueData.latitude,
        longitude: issueData.longitude,
        locationName: issueData.locationName,
        baseline_data: issueData.baseline_data,
        priority_score: urgencyScore,
        severity_tier: severityTier,
        impact_count: 1,
        status: 'Pending',
        timestamp: 'Just now',
        assignedDepartment: CATEGORY_METADATA[issueData.category].department,
        clusterId: `CLUSTER-ZONE-${String(nextNum).padStart(2, '0')}`,
        embedding: encodeTextEmbedding(issueData.description)
      };

      setIssues((prev) => [newIssue, ...prev]);
      setCreatedIssue(newIssue);
      setDuplicateResult({
        isDuplicate: false,
        duplicateTicketId: null,
        similarityScore: 0.0,
        distanceMeters: 0.0,
        matchReason: '✅ [APPROVED] No duplicate detected. Provisioning ticket routing...'
      });
    }

    // Trigger AI Processing Hub simulation modal
    setIsProcessingModalOpen(true);
  };

  // Dispatch emergency field crew
  const handleDispatchCrew = (issueId: string, unitName?: string) => {
    const chosenUnit = unitName || `Crew-${Math.floor(10 + Math.random() * 90)} [Rapid Response]`;
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            status: 'Dispatched',
            dispatchedUnit: chosenUnit,
            dispatchedAt: 'Just now'
          };
        }
        return issue;
      })
    );
    showToast(`🚨 Dispatched ${chosenUnit} to ${issueId}!`);
  };

  // Mark issue resolved
  const handleResolveIssue = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            status: 'Resolved'
          };
        }
        return issue;
      })
    );
    showToast(`Work Order #${issueId} marked Resolved!`);
  };

  // Reset to initial mock dataset
  const handleResetData = () => {
    setIssues(INITIAL_ISSUES);
    setUserGps(null);
    setLocationAddress('Peenya Industrial Corridor, Bangalore');
    showToast('Simulation dataset reset to initial metro seeds.');
  };

  // Preload Case A (Duplicate Report of TICKET_001 from Python script)
  const handlePreloadDuplicate = () => {
    setCurrentView('citizen');
    handleSubmitIssue({
      category: 'road_damage',
      title: 'Deep Dangerous Pothole Near Intersection',
      description: 'There is a deep pothole right in the middle of the street, highly dangerous for bikes.',
      locationName: 'Peenya Express Corridor (15m from TICKET_001)',
      latitude: 13.0286,
      longitude: 77.5451,
      baseline_data: {
        distance_to_nearest_hospital_meters: 150.0,
        distance_to_nearest_school_meters: 60.0,
        population_density_tier: 'high',
        is_peak_traffic_zone: true
      }
    });
  };

  const activeIssuesCount = issues.filter((i) => i.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white relative">
      {/* Persistent Sleek Header with GPS & Search */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onResetData={handleResetData}
        onPreloadDuplicate={handlePreloadDuplicate}
        activeCount={activeIssuesCount}
        userGps={userGps}
        locationAddress={locationAddress}
        isLocating={isLocating}
        onTriggerGps={handleTriggerGps}
        onSearchCity={handleSearchCity}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'citizen' ? (
          <CitizenPortal
            onSubmitIssue={handleSubmitIssue}
            onSimulateDuplicatePrefill={handlePreloadDuplicate}
            userGps={userGps}
            locationAddress={locationAddress}
            isLocating={isLocating}
            onTriggerGps={handleTriggerGps}
            nearbyIssues={issues}
          />
        ) : (
          <AdminDashboard
            issues={issues}
            onDispatchCrew={handleDispatchCrew}
            onResolveIssue={handleResolveIssue}
          />
        )}
      </main>

      {/* AI Processing Hub Live Simulation Modal */}
      <AIProcessingHubModal
        isOpen={isProcessingModalOpen}
        onClose={() => setIsProcessingModalOpen(false)}
        duplicateResult={duplicateResult}
        createdIssue={createdIssue}
        onGoToAdmin={() => {
          setIsProcessingModalOpen(false);
          setCurrentView('admin');
        }}
        onReportAnother={() => {
          setIsProcessingModalOpen(false);
        }}
      />

      {/* Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl glass-panel-elevated border border-blue-500/40 shadow-2xl flex items-center gap-3 font-mono text-xs text-white animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Truck className="w-4 h-4 animate-bounce" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
