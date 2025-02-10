// Create an instance of your script include class
var customRecords = new GetCustomRecords();

// Define the table (always sys_metadata)
var tableName = 'sys_metadata';

// Define the query (copy and paste from the condition builder)
var userQuery = 'sys_class_name=sys_script^sys_scope=global'; 
// You can replace this with any query you want

// Combine the table and query into one string to pass into the method
var tableQuery = tableName + '|' + userQuery;

// Define the batch size (set it to 1000 for testing)
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
