const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['*'],
    allowedHeaders: ['*']
}));

const ODOO_URL = 'http://localhost:8070/jsonrpc';
const DB = 'react_model';
const USER = 'admin';
const PASSWORD = 'admin';

async function odooLogin() {
    const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'common',
            method: 'login',
            args: [DB, USER, PASSWORD]
        },
        id: 1
    };
    
    const res = await axios.post(ODOO_URL, payload);
    return res.data.result;
}

app.get('/models', async (req, res) => {
    try {
        const uid = await odooLogin();
        const payload = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    DB,
                    uid,
                    PASSWORD,
                    'ir.model',
                    'search_read',
                    [],
                    { fields: ['model', 'name'] }
                ]
            },
            id: 2
        };

        const response = await axios.post(ODOO_URL, payload);
        res.json(response.data.result);
    } catch (error) {
        res.status(500).json({ detail: 'Failed to fetch models' });
    }
});

// app.get('/model-fields/:model_id', async (req, res) => {
//     try {
//         const uid = await odooLogin();
//         const modelId = parseInt(req.params.model_id);

//         const payload = {
//             jsonrpc: '2.0',
//             method: 'call',
//             params: {
//                 service: 'object',
//                 method: 'execute_kw',
//                 args: [
//                     DB,
//                     uid,
//                     PASSWORD,
//                     'ir.model.fields',
//                     'search_read',
//                     [[['model_id', '=', modelId]]],
//                     { fields: ['name', 'field_description'] }
//                 ]
//             },
//             id: 5
//         };

//         const response = await axios.post(ODOO_URL, payload);
        
//         if (!response.data.result) {
//             return res.status(404).json({ detail: 'No fields found for this model_id' });
//         }

//         res.json(response.data.result);
//     } catch (error) {
//         res.status(500).json({ detail: 'Failed to fetch field info' });
//     }
// });


app.get('/model-fields-by-name/:model_name', async (req, res) => {
    try {
        const uid = await odooLogin();
        const modelName = req.params.model_name;

        const payload = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    DB,
                    uid,
                    PASSWORD,
                    'ir.model.fields',
                    'search_read',
                    [[['model', '=', modelName]]],  // Search by 'model' name
                    { fields: ['name', 'field_description'] }
                ]
            },
            id: 6
        };

        const response = await axios.post(ODOO_URL, payload);

        if (!response.data.result || response.data.result.length === 0) {
            return res.status(404).json({ detail: 'No fields found for this model name' });
        }

        res.json(response.data.result);
    } catch (error) {
        console.error('Error fetching fields by model name:', error.message);
        res.status(500).json({ detail: 'Failed to fetch field info by model name' });
    }
});

// app.get('/field/:field_id/records', async (req, res) => {
//     try {
//         const uid = await odooLogin();
//         const fieldId = parseInt(req.params.field_id);

//         const fieldPayload = {
//             jsonrpc: '2.0',
//             method: 'call',
//             params: {
//                 service: 'object',
//                 method: 'execute_kw',
//                 args: [
//                     DB,
//                     uid,
//                     PASSWORD,
//                     'ir.model.fields',
//                     'search_read',
//                     [[['id', '=', fieldId]]],
//                     { fields: ['name', 'model_id'] }
//                 ]
//             },
//             id: 9
//         };

//         const fieldResponse = await axios.post(ODOO_URL, fieldPayload);
        
//         if (!fieldResponse.data.result || fieldResponse.data.result.length === 0) {
//             return res.status(404).json({ detail: 'Field not found' });
//         }

//         const fieldData = fieldResponse.data.result[0];
//         const fieldName = fieldData.name;
//         const modelId = fieldData.model_id[0];

//         const modelPayload = {
//             jsonrpc: '2.0',
//             method: 'call',
//             params: {
//                 service: 'object',
//                 method: 'execute_kw',
//                 args: [
//                     DB,
//                     uid,
//                     PASSWORD,
//                     'ir.model',
//                     'search_read',
//                     [[['id', '=', modelId]]],
//                     { fields: ['model'] }
//                 ]
//             },
//             id: 10
//         };

//         const modelResponse = await axios.post(ODOO_URL, modelPayload);
        
//         if (!modelResponse.data.result || modelResponse.data.result.length === 0) {
//             return res.status(404).json({ detail: 'Model not found' });
//         }

//         const modelName = modelResponse.data.result[0].model;

//         const recordsPayload = {
//             jsonrpc: '2.0',
//             method: 'call',
//             params: {
//                 service: 'object',
//                 method: 'execute_kw',
//                 args: [
//                     DB,
//                     uid,
//                     PASSWORD,
//                     modelName,
//                     'search_read',
//                     [],
//                     { fields: [fieldName], limit: 100 }
//                 ]
//             },
//             id: 11
//         };

//         const recordsResponse = await axios.post(ODOO_URL, recordsPayload);
        
//         res.json({
//             model: modelName,
//             field: fieldName,
//             records: recordsResponse.data.result || []
//         });
//     } catch (error) {
//         res.status(500).json({ detail: 'Failed to fetch records' });
//     }
// });

app.get('/model/:model_name/field/:field_name/records', async (req, res) => {
    try {
        const uid = await odooLogin();
        const { model_name, field_name } = req.params;

        const recordsPayload = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    DB,
                    uid,
                    PASSWORD,
                    model_name,
                    'search_read',
                    [],  // No filter, fetch all records
                    { fields: [field_name], limit: 100 }
                ]
            },
            id: 11
        };

        const recordsResponse = await axios.post(ODOO_URL, recordsPayload);

        res.json({
            model: model_name,
            field: field_name,
            records: recordsResponse.data.result || []
        });

    } catch (error) {
        res.status(500).json({ detail: 'Failed to fetch records', error: error.message });
    }
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});