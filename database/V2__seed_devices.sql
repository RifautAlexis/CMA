DO $$
BEGIN
	IF '${app_env}' = 'dev' THEN
		INSERT INTO device (ip_address, name)
		VALUES
			('192.168.1.10', 'Core Router'),
			('192.168.1.11', 'Edge Switch')
		ON CONFLICT (ip_address) DO NOTHING;
	END IF;
END;
$$;