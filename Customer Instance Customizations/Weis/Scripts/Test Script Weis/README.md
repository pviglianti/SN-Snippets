# Test Script Weis

This document provides an overview of the custom implementation of a script include and a background script that processes records in batches to improve performance. The script include is named `GetCustomRecords` with an API name of `global.GetCustomRecords` and is not client-callable.

## Script Include: GetCustomRecords

The `GetCustomRecords` script include contains a method to retrieve customer file IDs from the `sys_metadata` table based on specific conditions.

### File Path
```
/c:/Users/patri/OneDrive/PV Personal/Projects/Automation Pieces for Assessing Customer Instances/OOB Script Includes/UpdateVersionAPI OOB/UpdateVersionAPI.js
```

### Method: getCustomerFileIds

This method takes a `GlideRecord` object for the `sys_metadata` table and returns an array of customer file IDs.

```javascript
var UpdateVersionAPI = Class.create();
UpdateVersionAPI.prototype = {
    initialize: function() {
    },
    
    /* Returns an array of customer file IDs from the provided queried sys_metadata GlideRecord */
    /* Array */ getCustomerFileIds: function(/* sys_metadata */ files) {
        var ids = [];
        while(files.next()) {
            if(files.sys_update_name.nil())
                continue;
            
            var versions = new GlideRecord('sys_update_version');
            versions.addQuery('name', files.sys_update_name.toString());
            versions.query();
            
            // if a file has 0 versions, then not a customer file
            if(versions.getRowCount() === 0)
                continue;
            
            // if there exists a named version of source sys_upgrade_history or sys_store_app, then not a customer file
            var isCustomerFile = true;
            while(versions.next()) {
                var source = versions.source_table.toString();
                if(source === 'sys_upgrade_history' || source === 'sys_store_app') {
                    isCustomerFile = false;
                    break;
                }
            }
            if(isCustomerFile)
                ids.push(files.getUniqueValue());
        }
        return ids;
    },
    
    type: 'UpdateVersionAPI'
};

// Ensure script include record is accessible from all application scopes as it should be by default
```

## Background Script

The background script processes records in batches to improve performance. It logs the Sys_IDs of custom files, which can then be used to filter records in the `sys_metadata` table.

### File Path
```
/c:/Users/patri/OneDrive/PV Personal/Projects/Automation Pieces for Assessing Customer Instances/Test Script Weis/background script.js
```

### Script

```javascript
// Create an instance of your script include class
var customRecords = new GetCustomRecords();

// Define the table (always sys_metadata)
var tableName = 'sys_metadata';

// Define the query (copy and paste from the condition builder)
var userQuery = 'sys_class_name=sys_script^sys_scope=global'; 
// You can replace this with any query you want

// Combine the table and query into one string to pass into the method
var tableQuery = tableName + '|' + userQuery;

// Define the batch size (set it to 100 for testing)
var batchSize = 1000;

// Log the initial setup
gs.info('PV: Starting script with table: ' + tableName + ' and query: ' + userQuery);

// Create a GlideRecord object to query sys_metadata
var grTableRecords = new GlideRecord(tableName);
grTableRecords.addEncodedQuery(userQuery);
grTableRecords.query();

// Start batch processing
var processedCount = 0; // Keep track of how many records have been processed
var customSysIds = []; // Array to store Sys_IDs
var batchCounter = 1; // Batch counter to track batch numbers

// Log the total number of records to be processed
gs.info('PV: Total records to process: ' + grTableRecords.getRowCount());

while (grTableRecords.next()) {
    // Process record and check if it's custom (use your existing logic here)
    if (global.SncAppFiles.hasCustomerUpdate(grTableRecords)) {
        customSysIds.push(grTableRecords.getValue('sys_id'));
    }
    
    // Increment processed count
    processedCount++;

    // Check if batch size is reached
    if (processedCount >= batchSize) {
        // Log the current batch of Sys_IDs
        gs.info('PV: Batch ' + batchCounter + ' Processed Sys_IDs: ' + customSysIds.join(', '));
        
        // Reset the counter and array for the next batch
        processedCount = 0;
        customSysIds = [];
        batchCounter++;
    }
}

// If there are any remaining Sys_IDs that didn't reach the batch size, log them
if (customSysIds.length > 0) {
    gs.info('PV: Remaining Processed Sys_IDs: ' + customSysIds.join(', '));
}

// Log completion
gs.info('PV: Script execution completed.');
```

## Usage

1. **Run the Background Script**: Execute the background script to process records in batches. The script will log the Sys_IDs of custom files.
2. **Filter Records**: Use the logged Sys_IDs to filter records in the `sys_metadata` table. You can use the filter condition `sys_id IN <logged Sys_IDs>`.

This implementation helps in identifying and processing custom files efficiently by leveraging batch processing and logging.