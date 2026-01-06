import React, { useState } from 'react';
import { fetchModels, getRecordsByField, fetchModelFields } from './GetResponse';

const GroupManager = () => {
  const [models, setModels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [selectedModel, setSelectedModel] = useState({});

  const [model, setModel] = useState('');

  const [fields, setFields] = useState([]);
  

  const [addingFieldIndex, setAddingFieldIndex] = useState(null);
  const [newFieldName, setNewFieldName] = useState('');

  const handleAddGroup = () => {
    setShowModelSelect(true);
    fetchModels().then(setModels);
  };

  const handleSubmitGroup = () => {
    if (selectedModel) {
      setGroups([...groups, { model: selectedModel, fields: [], items: [] }]);
      setModel(selectedModel);
      setSelectedModel('');
      setShowModelSelect(false);
    }
  };

  const handleAddField = (groupIndex) => {
    if (!newFieldName) return;

    getRecordsByField(groups[groupIndex].model, newFieldName).then((records) => {
      if (!records.length) return;
  
      setGroups((prevGroups) => {
        const newGroups = [...prevGroups];
        const group = newGroups[groupIndex];
  
        if (!group.fields.includes(newFieldName)) {
          group.fields.push(newFieldName);
        }
  
        group.items = records.map((record) =>
          group.fields.map((field) => record[field] || "")
        );
  
        return newGroups;
      });
  
      setNewFieldName("");
      setAddingFieldIndex(null);
    });
  };

  const handleInputChange = (groupIndex, rowIndex, colIndex, value) => {
    const newGroups = [...groups];
    newGroups[groupIndex].items[rowIndex][colIndex] = value;
    setGroups(newGroups);
  };

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={handleAddGroup}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add New Table
      </button>

      {showModelSelect && (
        <div className="flex items-center space-x-2 mt-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Select Model</option>
            {models.map((model) => (
              <option key={model.id} value={model.model}>
                {model.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSubmitGroup}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
          >
            Submit
          </button>
        </div>
      )}

      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="border rounded shadow p-4 space-y-2 bg-white">
          <h2 className="text-lg font-semibold text-blue-600">{group.model}</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border text-center">
              <thead>
                <tr className="bg-gray-100">
                {(group.fields || []).map((field, fieldIndex) => (
                    <th key={fieldIndex} className="border px-2 py-1">
                      {field}
                    </th>
                  ))}
                  <th className="border px-2 py-1">
                    {addingFieldIndex === groupIndex ? (
                      <div className="flex space-x-1 items-center">
                        <select
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          className="border px-1 py-0.5 text-sm"
                        >
                          <option value="">Select Field</option>
                          {fields.map((f) => (
                            <option key={f.id} value={f.name}>
                              {f.field_description}
                            </option>
                          ))}
                          
                        </select>
                        <button
                          onClick={() => handleAddField(groupIndex)}
                          className="bg-green-500 text-white px-2 py-0.5 rounded text-sm"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingFieldIndex(groupIndex);
                          fetchModelFields(model).then(setFields);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        + Add Column
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(group.items || []).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border px-2 py-1">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) =>
                            handleInputChange(groupIndex, rowIndex, colIndex, e.target.value)
                          }
                          className="border px-1 py-0.5 w-full"
                        />
                      </td>
                    ))}
                    <td className="border px-2 py-1">---</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupManager;