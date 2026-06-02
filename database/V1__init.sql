CREATE TABLE device (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	ip_address TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT ck_device_name_not_blank CHECK (BTRIM(name) <> ''),
	CONSTRAINT ck_device_ip_not_blank CHECK (BTRIM(ip_address) <> '')
);

CREATE INDEX ix_device_name ON device (name);

CREATE TABLE communication_protocol (
	id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	code TEXT NOT NULL UNIQUE,
	description TEXT NOT NULL,
	CONSTRAINT ck_communication_protocol_code_not_blank CHECK (BTRIM(code) <> ''),
	CONSTRAINT ck_communication_protocol_description_not_blank CHECK (BTRIM(description) <> '')
);

CREATE TABLE device_protocol (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	device_id UUID NOT NULL REFERENCES device(id) ON DELETE CASCADE,
	protocol_id SMALLINT NOT NULL REFERENCES communication_protocol(id) ON DELETE RESTRICT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT uq_device_protocol_device_protocol UNIQUE (device_id, protocol_id)
);

CREATE INDEX ix_device_protocol_device_id ON device_protocol (device_id);
CREATE INDEX ix_device_protocol_protocol_id ON device_protocol (protocol_id);

CREATE TABLE device_protocol_snmp (
	device_protocol_id UUID PRIMARY KEY REFERENCES device_protocol(id) ON DELETE CASCADE,
	port INTEGER NOT NULL DEFAULT 161,
	version INTEGER NOT NULL DEFAULT 2,
	mib_2_branch TEXT NOT NULL DEFAULT '1.3.6.1.2.1',
	read_community TEXT NOT NULL DEFAULT 'public',
	write_community TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT ck_device_protocol_snmp_mib_2_branch_not_blank CHECK (BTRIM(mib_2_branch) <> ''),
	CONSTRAINT ck_device_protocol_snmp_read_community_not_blank CHECK (BTRIM(read_community) <> ''),
	CONSTRAINT ck_device_protocol_snmp_write_community_not_blank CHECK (BTRIM(write_community) <> ''),
	CONSTRAINT ck_device_protocol_snmp_port_valid CHECK (port BETWEEN 1 AND 65535)
);

INSERT INTO communication_protocol (code, description)
VALUES
	('SNMP', 'Simple Network Management Protocol');

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_device_protocol_is_snmp()
RETURNS TRIGGER AS $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM device_protocol dp
		JOIN communication_protocol cp ON cp.id = dp.protocol_id
		WHERE dp.id = NEW.device_protocol_id
		  AND cp.code = 'SNMP'
	) THEN
		RAISE EXCEPTION 'device_protocol_id % must reference protocol SNMP', NEW.device_protocol_id;
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_device_set_updated_at
BEFORE UPDATE ON device
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_device_protocol_set_updated_at
BEFORE UPDATE ON device_protocol
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_device_protocol_snmp_set_updated_at
BEFORE UPDATE ON device_protocol_snmp
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_device_protocol_snmp_ensure_snmp
BEFORE INSERT OR UPDATE ON device_protocol_snmp
FOR EACH ROW
EXECUTE FUNCTION ensure_device_protocol_is_snmp();
