# CivicPulse AI 🏙️
### An Intelligent Civic Issue Reporting and Prioritization System

Urban areas face persistent civic challenges, including damaged roads, overflowing garbage bins, malfunctioning streetlights, and blocked drainage systems. **CivicPulse AI** is a smart civic management platform designed to bridge the gap between citizens and municipal authorities. 

By replacing manual intake with agentic software automation, the platform minimizes redundant workflows, stops duplicate submissions, and mathematically evaluates the urgency of urban issues to ensure efficient municipal resource allocation.

---

## 🚀 Key Features

* **Geospatial & Semantic Clustering (Duplicate Detection):** Employs text vector embeddings (`Sentence-Transformers`) and `Haversine distance` boundaries to identify duplicate complaints. The system catches identical issues even if citizens describe them using completely different words.
* **Automated Urgency Scoring:** Eliminates user priority bias. Calculates a real-time **Civic Priority Score (0–100)** by processing dynamic weights based on issue categories, spatial proximity to critical infrastructure (hospitals, schools), and localized population densities.
* **Interactive Admin Dashboard:** Leverages geospatial mapping layers (`Leaflet.js` / GIS data layers) to visualize active issue hotspots, track repair resolution milestones, and streamline engineering team dispatches.
* **Transparent Citizen Portal:** Provides a clean, accessible interface for residents to file reports with photo verification, track live progress tickets, and observe community impacts.

---

## 🛠️ Built With

* **Frontend:** React.js / Tailwind CSS / Leaflet.js
* **Backend:** Python (FastAPI / Flask)
* **Database:** PostgreSQL with PostGIS extension (or MongoDB)
* **Machine Learning:** Sentence-Transformers (`all-MiniLM-L6-v2`), NumPy, Scikit-learn
