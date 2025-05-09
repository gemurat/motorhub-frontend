-- Enable the pgcrypto extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to safely log inventory changes
CREATE OR REPLACE FUNCTION log_store_inventory_changes()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields TEXT[];
    field_name TEXT;
    old_value TEXT;
    new_value TEXT;
BEGIN
    -- Initialize array to track changed fields
    changed_fields := '{}';
    
    -- Check each field for changes
    IF OLD.quantity IS DISTINCT FROM NEW.quantity THEN
        changed_fields := array_append(changed_fields, 'quantity');
    END IF;
    
    IF OLD.reserved_quantity IS DISTINCT FROM NEW.reserved_quantity THEN
        changed_fields := array_append(changed_fields, 'reserved_quantity');
    END IF;
    
    IF OLD.min_stock IS DISTINCT FROM NEW.min_stock THEN
        changed_fields := array_append(changed_fields, 'min_stock');
    END IF;
    
    IF OLD.max_stock IS DISTINCT FROM NEW.max_stock THEN
        changed_fields := array_append(changed_fields, 'max_stock');
    END IF;
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        changed_fields := array_append(changed_fields, 'status');
    END IF;
    
    IF OLD.is_warehouse IS DISTINCT FROM NEW.is_warehouse THEN
        changed_fields := array_append(changed_fields, 'is_warehouse');
    END IF;
    
    -- Only proceed if there are actual changes
    IF array_length(changed_fields, 1) > 0 THEN
        -- Insert audit records for each changed field
        FOREACH field_name IN ARRAY changed_fields
        LOOP
            -- Safely get old and new values
            EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', field_name, field_name)
            INTO old_value, new_value
            USING OLD, NEW;
            
            -- Insert audit record with error handling
            BEGIN
                INSERT INTO "StoreInventoryAudit" (
                    store_inventory_id,
                    field_changed,
                    old_value,
                    new_value,
                    changed_by,
                    changed_at
                ) VALUES (
                    NEW.id,
                    field_name,
                    old_value,
                    new_value,
                    COALESCE(current_setting('app.current_user_id', true)::integer, 0),
                    NOW()
                );
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but don't fail the transaction
                RAISE NOTICE 'Error logging audit for field %: %', field_name, SQLERRM;
            END;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely log stock movement changes
CREATE OR REPLACE FUNCTION log_stock_movement_changes()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields TEXT[];
    field_name TEXT;
    old_value TEXT;
    new_value TEXT;
BEGIN
    -- Initialize array to track changed fields
    changed_fields := '{}';
    
    -- Check each field for changes
    IF OLD.quantity IS DISTINCT FROM NEW.quantity THEN
        changed_fields := array_append(changed_fields, 'quantity');
    END IF;
    
    IF OLD.type IS DISTINCT FROM NEW.type THEN
        changed_fields := array_append(changed_fields, 'type');
    END IF;
    
    IF OLD.from_store_id IS DISTINCT FROM NEW.from_store_id THEN
        changed_fields := array_append(changed_fields, 'from_store_id');
    END IF;
    
    IF OLD.to_store_id IS DISTINCT FROM NEW.to_store_id THEN
        changed_fields := array_append(changed_fields, 'to_store_id');
    END IF;
    
    IF OLD.reference_id IS DISTINCT FROM NEW.reference_id THEN
        changed_fields := array_append(changed_fields, 'reference_id');
    END IF;
    
    IF OLD.notes IS DISTINCT FROM NEW.notes THEN
        changed_fields := array_append(changed_fields, 'notes');
    END IF;
    
    -- Only proceed if there are actual changes
    IF array_length(changed_fields, 1) > 0 THEN
        -- Insert audit records for each changed field
        FOREACH field_name IN ARRAY changed_fields
        LOOP
            -- Safely get old and new values
            EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', field_name, field_name)
            INTO old_value, new_value
            USING OLD, NEW;
            
            -- Insert audit record with error handling
            BEGIN
                INSERT INTO "StockMovementAudit" (
                    stock_movement_id,
                    field_changed,
                    old_value,
                    new_value,
                    changed_by,
                    changed_at
                ) VALUES (
                    NEW.id,
                    field_name,
                    old_value,
                    new_value,
                    COALESCE(current_setting('app.current_user_id', true)::integer, 0),
                    NOW()
                );
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but don't fail the transaction
                RAISE NOTICE 'Error logging audit for field %: %', field_name, SQLERRM;
            END;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the triggers with proper timing and conditions
CREATE TRIGGER store_inventory_audit_trigger
    AFTER UPDATE ON "StoreInventory"
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION log_store_inventory_changes();

CREATE TRIGGER stock_movement_audit_trigger
    AFTER UPDATE ON "StockMovements"
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION log_stock_movement_changes();

-- Create indexes on audit tables for better performance
CREATE INDEX IF NOT EXISTS idx_store_inventory_audit_timestamp 
ON "StoreInventoryAudit" (changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movement_audit_timestamp 
ON "StockMovementAudit" (changed_at DESC);

-- Create a function to clean up old audit records
CREATE OR REPLACE FUNCTION cleanup_old_audit_records()
RETURNS void AS $$
BEGIN
    -- Delete records older than 1 year
    DELETE FROM "StoreInventoryAudit" 
    WHERE changed_at < NOW() - INTERVAL '1 year';
    
    DELETE FROM "StockMovementAudit" 
    WHERE changed_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up old records (runs daily at 2 AM)
SELECT cron.schedule(
    'cleanup_old_audit_records',
    '0 2 * * *',
    'SELECT cleanup_old_audit_records()'
); 