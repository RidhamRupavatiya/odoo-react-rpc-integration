const ODOO_URL = 'http://localhost/jsonrpc';
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

  const response = await fetch(ODOO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
  });

  const data = await response.json();
  return data.result;
}

export async function fetchModels() {
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

  const response = await fetch(ODOO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
  });

  const data = await response.json();
  return data.result;
}

export async function fetchModelFields(modelName) {
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
        'ir.model.fields',
        'search_read',
        [[['model', '=', modelName]]],
        { fields: ['name', 'field_description'] }
      ]
    },
    id: 6
  };

  const response = await fetch(ODOO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!data.result) throw new Error('No fields found');
  return data.result;
}


export async function getRecordsByField(modelName, fieldName) {
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
        modelName,
        'search_read',
        [],
        { fields: [fieldName] }
      ]
    },
    id: 11
  };

  const response = await fetch(ODOO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!data.result) throw new Error('Failed to fetch records');
  return data.result;
}