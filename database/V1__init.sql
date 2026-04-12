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

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_device_set_updated_at
BEFORE UPDATE ON device
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
