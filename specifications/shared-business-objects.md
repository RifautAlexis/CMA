# Shared Business Objects Specification (BE + FE)

This document describes the product-level objects shared between Backend and Frontend.
It complements technical API documentation and should be readable by Product, Design, QA, and Engineering.

## Purpose

- Create a common language for shared data.
- Define business meaning of each field.
- Define validation and consistency rules expected by both BE and FE.

## Shared Business Objects

### 1. Device

Represents one managed network device in the system.

Fields:
- id
  - Meaning: stable unique identifier of a device
  - Type: UUID string
  - Mandatory: yes after creation
- name
  - Meaning: human-readable label shown in UI lists and forms
  - Type: text
  - Mandatory: yes
  - Length must be between 3 and 32 characters
- ipAddress
  - Meaning: network address used to identify and contact the device
  - Type: IPv4 text
  - Mandatory: yes
  - Unique
  - Valid IPv4 format
- createdAt
  - Meaning: creation timestamp
  - Type: date-time
  - Mandatory: yes
- updatedAt
  - Meaning: last update timestamp
  - Type: date-time
  - Mandatory: yes

### 2. SNMP Configuration

Represents optional SNMP settings attached to a device.
If SNMP is enabled for a device, this object must be complete.

Fields:
- snmpPort
  - Meaning: destination port used for SNMP communication
  - Type: number
  - Mandatory: yes
  - Must be between 1 and 65535
- snmpVersion
  - Meaning: SNMP protocol version
  - Type: number (1, 2, or 3)
  - Mandatory: yes
- mib2Branch
  - Meaning: root OID branch used for walk/polling scope
  - Type: text
  - Mandatory: yes
  - Must follow OID style format
- readCommunity
  - Meaning: SNMP read credential
  - Type: text
  - Mandatory: yes
  - Length must be between 1 and 64 characters
- writeCommunity
  - Meaning: SNMP write credential
  - Type: text
  - Mandatory: yes
  - Length must be between 1 and 64 characters