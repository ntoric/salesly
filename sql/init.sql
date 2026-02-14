-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'salesly') THEN

      CREATE ROLE salesly LOGIN PASSWORD 'salesly_pass';
   END IF;
END
$do$;

-- Grant database ownership and schema permissions
ALTER DATABASE salesly_db OWNER TO salesly;
GRANT ALL ON SCHEMA public TO salesly;