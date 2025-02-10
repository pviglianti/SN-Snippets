(function() {
    // Replace 'table_name' with the actual table name and 'sys_id' with the record's sys_id
    var gr = new GlideRecord('table_name');
    if (gr.get('sys_id')) {
        // Replace 'u_pass' with the actual password field name
        var encryptedPassword = gr.getValue('u_pass');
        var decryptedPassword = GlideEncrypter.decrypt(encryptedPassword);
        return decryptedPassword;
    } else {
        return 'Record not found';
    }
})();
