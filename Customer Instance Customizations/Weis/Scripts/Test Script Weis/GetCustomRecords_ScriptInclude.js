var GetCustomRecords = Class.create();
GetCustomRecords.prototype = {
    getCustomRecordSysIDs: function(tableQuery) {
        var tableQueryArr = tableQuery.split('|');
        var tableName = tableQueryArr[0];
        var query = tableQueryArr[1];

        var grTableRecords = new GlideRecord(tableName);
        if (query)
            grTableRecords.addEncodedQuery(query);
        grTableRecords.query();

        // Create a reference to UpdateVersionAPI
        var objUpdateVersionAPI = new global.UpdateVersionAPI();
        var arrCustomRecordSysIDs = objUpdateVersionAPI.getCustomerFileIds(grTableRecords);
        var arrChangedBaslineSysIDs = [];

        // Iterate over the records
        grTableRecords.restoreLocation();
        while (grTableRecords._next()) {
            if (global.SncAppFiles.hasCustomerUpdate(grTableRecords)) {
                arrChangedBaslineSysIDs.push(grTableRecords.getValue('sys_id'));
            }
        }

        return arrChangedBaslineSysIDs.join(',');
    },
    type: 'GetCustomRecords'
};
