const permissionService = require("../services/permissionService");

exports.get_all_permissions = (req, res) => {
    permissionService.getAllPermissions()
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
}

exports.get_permission_by_id = (req, res) => {
    const { id } = req.params;
    permissionService.getPermissionById(id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
}

exports.create_permission = (req, res) => {
    const { name } = req.body;
    permissionService.createPermission({ name })
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
}

exports.update_permission = (req, res) => {
    const {id} = req.params
    const data  = req.body;
    permissionService.updatePermission( id, data )
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
}

exports.delete_permission = (req, res) => {
    const { id } = req.params;
    permissionService.deletePermission(id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
}