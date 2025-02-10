# CodeSearch Background Script Results

## Summary of Results

| Table             | Record Name                | sys_id                                | Field  | Matches | Line Contexts                                                                                   |
|-------------------|----------------------------|---------------------------------------|--------|---------|-------------------------------------------------------------------------------------------------|
| `sys_security_acl`| `sys_metadata_customization` | `ed71b9e643703110a26e67db5bb8f238`    | `name` | 1       | Line 1: `sys_metadata_customization`                                                            |
| `sys_security_acl`| `sys_metadata_customization` | `1602b12a43703110a26e67db5bb8f286`    | `name` | 1       | Line 1: `sys_metadata_customization`                                                            |
| `sys_security_acl`| `sys_metadata_customization` | `7ac1fde643703110a26e67db5bb8f2ea`    | `name` | 1       | Line 1: `sys_metadata_customization`                                                            |
| `sys_security_acl`| `sys_metadata_customization` | `1bb13de643703110a26e67db5bb8f2a3`    | `name` | 1       | Line 1: `sys_metadata_customization`                                                            |
| `sys_security_acl`| `sys_metadata_customization` | `a96179e643703110a26e67db5bb8f2c0`    | `name` | 1       | Line 1: `sys_metadata_customization`                                                            |
| `sys_security_acl`| `sys_metadata_customization` | `4c5139e643703110a26e67db5bb8f2a0`    | `name` | 1       | Line 1: `sys_metadata_customization`                                                            |
| `sys_script_include`| `UACountEvaluatorScript`   | `a12ccc123b2013007fef460044efc426`    | `script`| 3       | Line 21: `this.INVALID_JOIN_TABLE_COLUMN = gs.getMessage("Invalid Join column in Join table");`<br>Line 22: `this.INVALID_SYS_METADATA_CUSTOMIZATION_TABLE = gs.getMessage("Table sys_metadata_customization not present");`<br>Line 23: `},`<br>Line 109: `case -12:`<br>Line 110: `return this.INVALID_SYS_METADATA_CUSTOMIZATION_TABLE;`<br>Line 111: `}` |

## Explanation

- **Table `sys_security_acl`**:
  - Found multiple records with the name `sys_metadata_customization`.
  - Each record had 1 match in the `name` field, all on Line 1.

- **Table `sys_script_include`**:
  - Found a record named `UACountEvaluatorScript`.
  - The `script` field had 3 matches:
    - Line 21: `this.INVALID_JOIN_TABLE_COLUMN = gs.getMessage("Invalid Join column in Join table");`
    - Line 22: `this.INVALID_SYS_METADATA_CUSTOMIZATION_TABLE = gs.getMessage("Table sys_metadata_customization not present");`
    - Line 23: `},`
    - Line 109: `case -12:`
    - Line 110: `return this.INVALID_SYS_METADATA_CUSTOMIZATION_TABLE;`
    - Line 111: `}`
