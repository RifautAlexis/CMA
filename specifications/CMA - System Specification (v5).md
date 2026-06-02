# 📘 CMA – System Specification (v5 – User Story Driven)

---

## 1. Introduction

CMA (Collect Monitor Act) is a monitoring and automation platform that enables users to register devices, collect metrics and alarms from them, define rules based on collected data, and trigger automated actions when those rules are satisfied.

The system is designed as a full web-based application composed of a user interface, backend services, and distributed workers responsible for data collection, processing, rule evaluation, and action execution.

CMA supports both **polling-based** and **event-driven** communication protocols, allowing flexible integration with a wide range of devices and systems.

---

## 2. Users and Authentication

The system provides a secure authentication mechanism allowing users to create accounts and log in to the platform.

Users must be able to register using the web interface by providing required credentials. Once registered, users can authenticate themselves to access the system.

Authentication ensures that only authorized users can:

- manage devices,
- define rules,
- view monitoring data,
- and access logs.

The system must maintain session security and protect user data according to standard security practices.

---

## 3. Device Management

Users can perform full CRUD (Create, Read, Update, Delete) operations on devices through the web interface.

A device represents a monitored entity and contains configuration details required for data collection. When creating or updating a device, the user defines how the device should be monitored.

---

## 3.1 Protocol Configuration

Each device can be associated with one or more communication protocols. These protocols define how CMA interacts with the device to collect or receive data.

Supported communication types include:

- polling-based protocols (e.g., SNMP, HTTP APIs),
- push-based protocols (e.g., SNMP traps, webhooks).

A device may use a single protocol or multiple protocols simultaneously. For example, metrics may be collected via polling while alarms are received through push events.

The user must be able to configure protocol-specific parameters such as endpoints, credentials, polling intervals, and other relevant settings through the UI.

---

## 3.2 Device Monitoring Behavior

Once a device is configured and enabled, CMA automatically monitors it according to its protocol configuration.

Polling-based protocols are executed by background workers that periodically collect data from devices.

Push-based protocols rely on external systems sending data to CMA, which is then processed in real time.

All collected data is normalized and processed by the system regardless of its origin.

---

## 4. Data Types

CMA handles two primary types of data: metrics and alarms.

Metrics represent continuous measurements such as CPU usage, memory consumption, or network throughput. These values are typically numerical and are collected over time to analyze trends.

Alarms represent discrete states indicating abnormal or significant conditions. Each alarm includes a severity level that reflects its criticality. Severity is a key attribute used in rule evaluation and visualization.

---

## 5. Monitoring and Visualization

Users must be able to visualize the state of the monitored system through the web interface.

---

## 5.1 Devices with Active Alarms

The UI must provide a view of devices that currently have active alarms. For each device, the system should display:

- active alarms,
- alarm severity,
- and relevant contextual information.

This allows users to quickly identify critical situations across their infrastructure.

---

## 5.2 Metrics Visualization

Users must be able to explore metric data through:

- statistical summaries,
- and graphical representations over time.

Metrics should be presented in a way that allows users to:

- observe trends,
- detect anomalies,
- and analyze historical behavior.

Charts and statistics must be generated from the time-series data stored by the system.

---

## 6. Rule Management

Users can perform CRUD operations on rules through the web interface.

Rules define the logic used to determine when the system should react to observed data.

---

## 6.1 Rule Definition

A rule is composed of:

- references to one or more metrics and/or alarms,
- logical operators such as AND and OR,
- comparison operators such as greater than, less than, or equality.

Rules allow users to express conditions combining multiple signals from one or more devices.

For example, a rule may depend on a metric threshold combined with an alarm severity condition.

---

## 6.2 Rule Behavior

Rules are evaluated continuously as new data is received by the system.

Each rule has a state that can be either true or false. A rule triggers only when its state changes.

- When a rule transitions from false to true, it is considered triggered.
- When a rule transitions from true to false, it is considered untriggered.

This ensures that actions are executed only when meaningful changes occur.

---

## 6.3 Actions on Rule Trigger

Users must be able to define one or more actions that are executed when a rule becomes triggered.

Actions can include operations such as:

- sending HTTP requests,
- executing SNMP SET commands,
- or interacting with other systems via supported protocols.

Multiple actions can be associated with a single rule trigger, allowing complex workflows to be defined.

---

## 6.4 Reverse Actions on Rule Untrigger

Users must also be able to define reverse actions that are executed when a rule transitions from triggered to untriggered.

This allows the system to revert previously applied changes. For example, if a rule activates a physical switch when a condition is met, a reverse action can deactivate that switch when the condition is no longer satisfied.

Reverse actions are essential to maintain consistency between system state and external systems.

---

## 7. Logs and Observability

Users must have access to system logs through the web interface.

Logs provide visibility into:

- system behavior,
- rule evaluations,
- action executions,
- errors and failures,
- and general operational events.

The logging system must allow users to inspect past events to diagnose issues and understand system activity.

---

## 8. Data Processing Flow

The system operates through a continuous flow of data:

Devices are monitored either through polling workers or push-based endpoints. Collected data is normalized and processed by the ingestion pipeline.

The system then:

- stores metrics in a time-series database,
- stores current states in a transactional database,
- detects changes in metrics and alarms,
- emits events when changes occur,
- evaluates rules based on these events,
- and executes actions when rule states change.

This event-driven flow ensures that the system remains responsive and scalable.

---

## 9. System Capabilities Summary

CMA provides a unified platform that enables users to:

- authenticate and manage access,
- register and configure devices,
- define communication protocols per device,
- monitor metrics and alarms,
- visualize system state and historical data,
- define rules combining metrics and alarms,
- attach actions and reverse actions to rules,
- and observe system behavior through logs and dashboards.

---

## 10. Key Design Principles

The system is designed around the following principles:

- **Separation of concerns** between data collection, processing, rule evaluation, and action execution
- **Event-driven architecture** to decouple components
- **Stateful rule evaluation** to avoid redundant triggers
- **Support for both polling and push-based data sources**
- **Scalability through distributed workers and horizontal scaling**
- **User-driven configuration via a web interface**
