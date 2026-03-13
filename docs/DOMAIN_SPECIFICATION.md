# SOS Location: Domain Specification & Ubiquitous Language

This document consolidates the domain vision, ubiquitous language, and the core DDD (Domain-Driven Design) structure for the SOS Location platform.

---

## 1. Domain Vision

**SOS Location** is a resilient platform designed for:
- Detecting and registering incidents.
- Receiving distress calls (SOS).
- Tracking people, teams, and devices.
- Coordinating response and rescue operations.
- Operating with partial or non-existent connectivity.
- Integrating sensors, mesh/LoRa networks, maps, and risk rules.

---

### Core Entities
- **Incident**: A primary disaster event occurring at a specific time and place. Forms the root of most operational data.
- **Attention Alert**: A critical, real-time localized warning (e.g., flash flood, landslide risk) indexed from providers like CEMADEN or Defesa Civil.
- **SOS Request**: An explicit request for help originated by a person or device.
- **Rescue Group**: A coordinated team of volunteers or professionals assigned to tasks (e.g., firefighters, civil defense units).
- **Mission**: A tactical operation created to address one or more incidents, involving Search Areas and Assignments.
- **Search Area**: A geofenced polygon where rescue operations or sweeps are actively being conducted.
- **Edge Hub**: A local gateway node (RPi, mobile server) responsible for data synchronization in degraded environments.
- **Mesh Network**: A peer-to-peer communication layer allowing nodes (Hubs, Mobile Apps) to communicate without a central internet uplink.
- **Tactical Map**: The specialized 2D/3D interface used by Responders and Admins for mission coordination.
- **Gaussian Splatting**: 3D reconstruction technology used for high-fidelity situational awareness in the SOS dashboard.

---

## 3. Bounded Contexts

### 3.1 Incident Management
- **Responsibility**: Register, classify, and track incidents.
- **Key Terms**: Incident, Incident Type, Severity, Status, Evidence, Source, Confirmation.

### 3.2 SOS & Distress
- **Responsibility**: Handle distress calls, prioritize, and correlate with incidents.
- **Key Terms**: SOS Request, Distress Message, Sender, Acknowledgement, Priority, Escalation.

### 3.3 Geolocation Tracking
- **Responsibility**: Track positions, trails, geofences, and history.
- **Key Terms**: GeoPosition, Tracking Session, Location Update, Last Known Position, GeoFence, Movement Trail.

### 3.4 Rescue Coordination
- **Responsibility**: Transform incidents into operational action (Missions).
- **Key Terms**: Mission, Assignment, Responder Unit, Dispatch, Evacuation Route, Checkpoint.

### 3.5 Communication Network
- **Responsibility**: Reliable message exchange in degraded scenarios (Mesh/Offline).
- **Key Terms**: Mesh Message, Peer Relay, Gateway, Communication Node, Delivery Status, Message Envelope.

### 3.6 Sensor Monitoring
- **Responsibility**: Environment data and field signals.
- **Key Terms**: Sensor Node, Sensor Reading, Threshold Breach, Environmental Signal, Flood Level, Seismic Activity.

### 3.7 Mapping & Visualization
- **Responsibility**: Spatial view of the system.
- **Key Terms**: Crisis Map, Incident Marker, Terrain Layer, Risk Layer, Heatmap, Route Overlay.

---

## 4. Aggregate Roots

### 5.1 Incident Aggregate
- **Root**: `Incident`
- **Internal elements**: IncidentId, Type, Severity, Status, Source, Evidence, AffectedArea, Timeline.
- **Rules**: Cannot close if critical mission is open; severity reduction requires explicit rule/validation.

### 5.2 SOS Request Aggregate
- **Root**: `SOSRequest`
- **Elements**: SenderId, PositionSnapshot, Priority, Status, LinkedIncidentId.
- **Rules**: Preserve position at time of request; resolved SOS cannot go back to new.

### 5.3 Mission Aggregate
- **Root**: `Mission`
- **Elements**: MissionType, Status, AssignedResponders, TargetIncident, RoutePlan, Checkpoints.
- **Rules**: Requires minimum resources to start; closed mission must record outcome.

### 5.4 Tracking Session Aggregate
- **Root**: `TrackingSession`
- **Elements**: TrackedSubjectId, LastKnownPosition, PositionHistory, ActiveGeoFences.
- **Rules**: Discared regressive timestamps; preserve precision of last known position.

---

## 5. Domain Events

### Incident Management
- `IncidentReported`, `IncidentConfirmed`, `IncidentEscalated`, `IncidentClosed`.

### SOS & Distress
- `SOSRequestReceived`, `SOSRequestAcknowledged`, `SOSRequestResolved`.

### Geolocation Tracking
- `LocationUpdated`, `GeoFenceEntered`, `GeoFenceExited`, `TrackingLost`.

### Rescue Coordination
- `MissionCreated`, `MissionStarted`, `MissionCompleted`, `MissionAborted`.

---

## 6. Implementation Workflow

To evolve this domain, the following order is recommended:
1. Finalize official glossary.
2. Define Bounded Contexts.
3. Choose initial Aggregates.
4. Model Commands and Events.
5. Setup backend skeleton.
6. Design Map and Operation read models.
7. Integrate networks/sensors via defined contracts.

---
**SOS Location © 2026** - *Documentation consolidated and updated on 2026-03-14.*
