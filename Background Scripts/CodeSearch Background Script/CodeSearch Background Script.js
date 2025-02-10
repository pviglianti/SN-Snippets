// Configuration
var searchConfig = {
    searchGroup: 'sn_codesearch.Default Search Group',
    searchTable: null,
    globalSearch: false,
    extendedMatching: false,
    currentApplication: gs.getCurrentApplicationId(),
    limit: parseInt(gs.getProperty('sn_codesearch.search.results.max', 500))
};

// Caches
var fieldListCache = {},
    extendedFieldListCache = {},
    tableLabelCache = {};

// Helper functions
function getSearchGroupGr() {
    var sg = new GlideRecord('sn_codesearch_search_group');
    sg.addQuery('name', searchConfig.searchGroup);
    sg.query();
    if (sg.next()) {
        searchConfig.searchGroupGr = sg;
        searchConfig.extendedMatching = (sg.getValue("extended_matching") == 'true') || (sg.getValue("extended_matching") == '1');
    } else {
        gs.error("Search group not found: " + searchConfig.searchGroup);
    }
}

function getSearchTableGr() {
    var st = new GlideRecord('sn_codesearch_table');
    st.addQuery('search_group', searchConfig.searchGroupGr.getUniqueValue());
    st.addQuery('table', searchConfig.searchTable);
    st.query();
    if (st.next()) {
        searchConfig.searchTableGr = st;
    } else {
        gs.error("Search table not found: " + searchConfig.searchTable);
    }
}

function getTableLabel(className) {
    if (tableLabelCache.hasOwnProperty(className)) {
        return tableLabelCache[className];
    }
    var tableLabel = new GlideRecord(className).getClassDisplayValue();
    tableLabelCache[className] = tableLabel;
    return tableLabel;
}

function getFieldList(record) {
    var className = record.getRecordClassName();
    if (fieldListCache.hasOwnProperty(className)) {
        return fieldListCache[className];
    }
    var fieldList = searchConfig.searchTableGr.getValue('search_fields').replace(' ', ',').split(',');
    fieldList = fieldList.filter(Boolean); // Replaces _.compact
    fieldList = uniqueArray(fieldList); // Replaces _.unique
    fieldListCache[className] = fieldList;
    getExtendedFieldList(record);
    return fieldList;
}

function uniqueArray(arr) {
    var uniqueArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (uniqueArr.indexOf(arr[i]) === -1) {
            uniqueArr.push(arr[i]);
        }
    }
    return uniqueArr;
}

function getExtendedFieldList(record) {
    var className = record.getRecordClassName();
    if (extendedFieldListCache.hasOwnProperty(className)) {
        return extendedFieldListCache[className];
    }
    var extendedFieldList = getFieldList(record);
    if (searchConfig.extendedMatching) {
        var tableList = new GlideTableHierarchy(className).getTables();
        var dictionary = new GlideRecord('sys_dictionary');
        dictionary.addQuery("name", "IN", tableList.join(","));
        dictionary.addQuery("internal_type.scalar_type", "string");
        dictionary.addQuery("internal_type.name", "!=", "collection");
        dictionary.addQuery("element", "!=", "sys_update_name");
        dictionary.addQuery("max_length", ">=", 80);
        dictionary.query();
        while (dictionary.next()) {
            extendedFieldList.push(dictionary.getValue("element"));
        }
        extendedFieldList = uniqueArray(extendedFieldList); // Replaces _.unique
        extendedFieldListCache[className] = extendedFieldList;
    }
    return extendedFieldList;
}

function hasTerm(text, term) {
    return text && term && text.toLowerCase().indexOf(term.toLowerCase()) > -1;
}

function countTerm(text, term) {
    term = term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    return (text.match(new RegExp(term, "gi")) || []).length;
}

function getMatchingLines(text, term) {
    var lineMatches = [];
    var lines = text.split(/\r\n|\r|\n/g);
    for (var j = 0; j < lines.length; j++) {
        var line = lines[j];
        if (hasTerm(line, term)) {
            if (j > 0) {
                lineMatches.push({ line: j, context: lines[j - 1], escaped: escapeHtml(lines[j - 1]) });
            }
            lineMatches.push({ line: j + 1, context: line, escaped: escapeHtml(line) });
            if (j < lines.length - 1) {
                lineMatches.push({ line: j + 2, context: lines[j + 1], escaped: escapeHtml(lines[j + 1]) });
            }
        }
    }
    return lineMatches;
}

function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function getMatches(record, term) {
    var context = [];
    var fieldList = getExtendedFieldList(record);
    for (var i = 0; i < fieldList.length; i++) {
        var field = fieldList[i];
        var text = record.getValue(field);
        var fieldLabel = record[field].getLabel();
        var matchObj = {
            field: field,
            fieldLabel: fieldLabel,
            lineMatches: [],
            count: 0
        };
        if (text && hasTerm(text, term)) {
            matchObj.count = countTerm(text, term);
            matchObj.lineMatches = getMatchingLines(text, term);
        }
        if (matchObj.lineMatches.length > 0) {
            context.push(matchObj);
        }
    }
    return context;
}

function getHit(record, term) {
    if (!record.canRead()) {
        return;
    }
    var matches = getMatches(record, term);
    if (matches.length <= 0) {
        return;
    }
    var hit = {};
    var gdt = new GlideDateTime();
    gdt.setValue(record.getValue('sys_updated_on'));
    hit.name = record.getDisplayValue();
    hit.className = record.getRecordClassName();
    hit.tableLabel = record.getTableName();
    if (hit.tableLabel == 'sys_metadata') {
        hit.tableLabel = getTableLabel(hit.className);
    }
    hit.matches = matches;
    hit.sysId = record.getUniqueValue();
    hit.modified = gdt.getNumericValue();
    return hit;
}

function searchOnlyScripts(term, limit) {
    if (gs.nil(limit)) {
        limit = searchConfig.limit;
    }
    var ret = {
        recordType: searchConfig.searchTable,
        hits: [],
        tableLabel: searchConfig.searchTable
    };
    var tableSearchConfig = {
        fields: getFieldList(new GlideRecord(searchConfig.searchTable))
    };
    var encodedQuery = [];
    for (var i = 0; i < tableSearchConfig.fields.length; i++) {
        var field = tableSearchConfig.fields[i];
        encodedQuery.push(field + "LIKE" + term);
    }
    var records = new GlideRecord(searchConfig.searchTable);
    if (records.isValid()) {
        records.addEncodedQuery(encodedQuery.join("^OR") + "^EQ");
        if (searchConfig.searchTableGr && searchConfig.searchTableGr.getValue('additional_filter')) {
            records.addEncodedQuery(searchConfig.searchTableGr.getValue('additional_filter'));
        }
        if (!searchConfig.globalSearch && records.isValidField("sys_scope")) {
            records.addQuery("sys_scope", searchConfig.currentApplication).addOrCondition("sys_scope.scope", searchConfig.currentApplication);
        }
        if (records.isValidField("sys_class_name")) {
            records.addQuery('sys_class_name', 'NOT IN', 'sn_codesearch_search_group,sn_codesearch_table,sys_metadata_delete');
        }
        records.orderBy("sys_class_name");
        records.orderBy("sys_name");
        records.setLimit(limit);
        records.query();
        while (records.next()) {
            var hit = getHit(records, term);
            if (hit) {
                ret.hits.push(hit);
            }
        }
    }
    return ret;
}

// Main script execution
getSearchGroupGr();
if (searchConfig.searchTable) {
    getSearchTableGr();
    var results = searchOnlyScripts('sys_metadata_customization');
    if (results.hits.length > 0) {
        results.hits.forEach(function(hit) {
            gs.info('Table: ' + hit.tableLabel);
            gs.info('Record: ' + hit.name + ' (sys_id: ' + hit.sysId + ')');
            hit.matches.forEach(function(match) {
                gs.info('Field: ' + match.field + ', Matches: ' + match.count);
                match.lineMatches.forEach(function(lineMatch) {
                    gs.info('Line ' + lineMatch.line + ': ' + lineMatch.context);
                });
            });
        });
    } else {
        gs.info('No matches found for the term: sys_metadata_customization');
    }
} else {
    gs.warn("No search table specified, searching entire group one table at a time. This may be slow.");
    var tableList = [];
    var sgt = new GlideRecord('sn_codesearch_table');
    sgt.addQuery('search_group', searchConfig.searchGroupGr.getUniqueValue());
    sgt.query();
    while (sgt.next()) {
        tableList.push(sgt.getValue('table'));
    }
    var allResults = [];
    tableList.forEach(function(table) {
        searchConfig.searchTable = table;
        getSearchTableGr();
        var tableResults = searchOnlyScripts('sys_metadata_customization');
        allResults.push(tableResults);
    });
    allResults.forEach(function(results) {
        if (results.hits.length > 0) {
            results.hits.forEach(function(hit) {
                gs.info('Table: ' + hit.tableLabel);
                gs.info('Record: ' + hit.name + ' (sys_id: ' + hit.sysId + ')');
                hit.matches.forEach(function(match) {
                    gs.info('Field: ' + match.field + ', Matches: ' + match.count);
                    match.lineMatches.forEach(function(lineMatch) {
                        gs.info('Line ' + lineMatch.line + ': ' + lineMatch.context);
                    });
                });
            });
        }
    });
}
