-- VantageOS User Seed SQL
-- Run against Railway Postgres to create/update admin users

-- Ensure organization exists
INSERT INTO "Organization" (id, name, slug, "createdAt", "updatedAt")
SELECT '01syhi_digital_org_id', 'SYHI Digital', 'syhi-digital', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Organization" LIMIT 1);

-- Get the organization ID
DO $$
DECLARE
    org_id TEXT;
    marcin_id TEXT;
    lucas_id TEXT;
    hashed_pw TEXT := '$2b$12$fzxnS6Thod8CfGp0cxoXI.dnTwnkXnSu98EUGWBASDiqXph.aUwPS';
BEGIN
    SELECT id INTO org_id FROM "Organization" LIMIT 1;
    
    -- MARCIN
    SELECT id INTO marcin_id FROM "User" WHERE email = 'marcin.k@syhidigital.com';
    IF marcin_id IS NULL THEN
        marcin_id := 'usr_marcin_admin_001';
        INSERT INTO "User" (id, email, name, "hashedPassword", role, "organizationId", "createdAt", "updatedAt")
        VALUES (marcin_id, 'marcin.k@syhidigital.com', 'Marcin Kapusta', hashed_pw, 'META_ADMIN', org_id, NOW(), NOW());
        RAISE NOTICE 'Created marcin.k@syhidigital.com';
    ELSE
        UPDATE "User" SET role = 'META_ADMIN', "hashedPassword" = hashed_pw, "updatedAt" = NOW() WHERE id = marcin_id;
        RAISE NOTICE 'Updated marcin.k@syhidigital.com';
    END IF;
    
    -- Ensure Account for Marcin
    IF NOT EXISTS (SELECT 1 FROM "Account" WHERE "userId" = marcin_id AND "providerId" = 'credential') THEN
        INSERT INTO "Account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
        VALUES ('acc_marcin_cred_001', marcin_id, marcin_id, 'credential', hashed_pw, NOW(), NOW());
        RAISE NOTICE 'Created Account for marcin.k';
    ELSE
        UPDATE "Account" SET password = hashed_pw, "updatedAt" = NOW() WHERE "userId" = marcin_id AND "providerId" = 'credential';
        RAISE NOTICE 'Updated Account for marcin.k';
    END IF;
    
    -- LUCAS
    SELECT id INTO lucas_id FROM "User" WHERE email = 'lucas.o@syhidigital.com';
    IF lucas_id IS NULL THEN
        lucas_id := 'usr_lucas_admin_001';
        INSERT INTO "User" (id, email, name, "hashedPassword", role, "organizationId", "createdAt", "updatedAt")
        VALUES (lucas_id, 'lucas.o@syhidigital.com', 'Lucas O', hashed_pw, 'META_ADMIN', org_id, NOW(), NOW());
        RAISE NOTICE 'Created lucas.o@syhidigital.com';
    ELSE
        UPDATE "User" SET role = 'META_ADMIN', "hashedPassword" = hashed_pw, "updatedAt" = NOW() WHERE id = lucas_id;
        RAISE NOTICE 'Updated lucas.o@syhidigital.com';
    END IF;
    
    -- Ensure Account for Lucas
    IF NOT EXISTS (SELECT 1 FROM "Account" WHERE "userId" = lucas_id AND "providerId" = 'credential') THEN
        INSERT INTO "Account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
        VALUES ('acc_lucas_cred_001', lucas_id, lucas_id, 'credential', hashed_pw, NOW(), NOW());
        RAISE NOTICE 'Created Account for lucas.o';
    ELSE
        UPDATE "Account" SET password = hashed_pw, "updatedAt" = NOW() WHERE "userId" = lucas_id AND "providerId" = 'credential';
        RAISE NOTICE 'Updated Account for lucas.o';
    END IF;
    
    RAISE NOTICE 'Done! Both users seeded.';
END $$;
