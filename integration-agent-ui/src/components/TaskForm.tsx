import React, { useState, useEffect } from 'react'
import {
  Task, TaskType, LogicType, ConnectorType, InputSource,
  ConnectorConfig, EmailConnectorConfig, MessageQueueConnectorConfig,
  WebServiceConnectorConfig, DatabaseConnectorConfig, ServiceType, QueryType,
} from '../types' // Import new types

interface TaskFormProps {
  task: Task
  onSave: (task: Task) => void
  onCancel: () => void
}

// Define an internal interface that extends Task with option_type and connector_config
interface TaskFormData extends Task {
  option_type?: string;
  connector_config?: ConnectorConfig; // Ensure this is included
}

// Define OptionType as an enum
enum OptionTypeEnum {
  NONE = "None",
  DATE_TIME_INCREMENTAL = "DateTimeIncremental",
  UNIQUE_ID_INCREMENTAL = "UniqueIDIncremental"
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  // Initialize formData with task data, including connector_config
  const [formData, setFormData] = useState<TaskFormData>(() => {
    return {
      ...task,
      option_type: task.option_type || OptionTypeEnum.NONE,
      connector_config: task.connector_config || undefined, // Initialize connector_config
    };
  });

  // Reset form when task prop changes
  useEffect(() => {
    setFormData({
      ...task,
      option_type: task.option_type || OptionTypeEnum.NONE,
      connector_config: task.connector_config || undefined,
    });
  }, [task.id]); // Only reset when task ID changes

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Add a loading state for the Save button
  const [isSaving, setIsSaving] = useState(false);

  // Update handleChange to handle nested connector_config fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    // Handle changes within connector_config
    if (name.startsWith('connector_config.')) {
      const configField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        connector_config: {
          ...(prev.connector_config as any),
          [configField]: newValue,
        },
      }));
    } else if (name === 'connector_type') {
      // Reset connector_config when connector_type changes
      setFormData(prev => ({
        ...prev,
        // Use 'value' directly here as it's guaranteed to be a string from the select
        [name]: value,
        connector_config: undefined, // Reset config
      }));
    } else if (name === 'type') {
      // Reset type-specific fields including connector details if type changes
      let updatedTask: TaskFormData = {
        ...formData,
        [name]: value,
        logic_type: undefined,
        connector_type: undefined,
        input_source: undefined,
        input: '',
        response: '',
        option_type: OptionTypeEnum.NONE,
        connector_config: undefined, // Reset config
      };
      setFormData(updatedTask);
    } else {
      setFormData({ ...formData, [name]: newValue });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Update validation logic
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // --- Existing validations ---
    if (!formData.name?.trim()) newErrors.name = 'Task name is required';
    if (formData.type === TaskType.LOGIC && !formData.logic_type) {
      newErrors.logic_type = 'Logic type is required for Logic tasks';
    }
    if (formData.type === TaskType.INPUT && !formData.input_source) {
      newErrors.input_source = 'Input source is required for Input tasks';
    }
    if ((formData.type === TaskType.INPUT || formData.type === TaskType.OUTPUT) && !formData.connector_type) {
      newErrors.connector_type = 'Connector type is required for Input/Output tasks';
    }

    // --- Connector Config Validations ---
    if (formData.connector_type && !formData.connector_config) {
      newErrors.connector_config = 'Connector configuration is missing.';
    } else if (formData.connector_config) {
      switch (formData.connector_type) {
        case ConnectorType.EMAIL:
          const emailConfig = formData.connector_config as EmailConnectorConfig;
          if (!emailConfig.fromEmail) newErrors['connector_config.fromEmail'] = 'From Email is required.';
          if (!emailConfig.email) newErrors['connector_config.email'] = 'To Email is required.';
          if (!emailConfig.subject) newErrors['connector_config.subject'] = 'Subject is required.';
          break;
        case ConnectorType.MESSAGE_QUEUE:
          const mqConfig = formData.connector_config as MessageQueueConnectorConfig;
          if (!mqConfig.queuePath) newErrors['connector_config.queuePath'] = 'Queue Path is required.';
          break;
        case ConnectorType.WEB_SERVICE:
          const wsConfig = formData.connector_config as WebServiceConnectorConfig;
          if (!wsConfig.serviceType) newErrors['connector_config.serviceType'] = 'Service Type is required.';
          if (!wsConfig.endPoint) newErrors['connector_config.endPoint'] = 'Endpoint is required.';
          break;
        case ConnectorType.DATABASE:
          const dbConfig = formData.connector_config as DatabaseConnectorConfig;
          if (!dbConfig.databaseType) newErrors['connector_config.databaseType'] = 'Database Type is required.';
          if (!dbConfig.connectionString) newErrors['connector_config.connectionString'] = 'Connection String is required.';
          if (!dbConfig.queryType) newErrors['connector_config.queryType'] = 'Query Type is required.';
          if (!dbConfig.query) newErrors['connector_config.query'] = 'Query is required.';
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log("TaskForm - handleSubmit called");
    console.trace("Submit trace");
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (isSaving) {
      console.log("TaskForm - Already saving, ignoring duplicate submit");
      return;
    }
    
    // Validate the form
    if (validateForm()) {
      console.log("TaskForm - Validation passed, calling onSave with data:", formData);
      console.log("TaskForm - Connector details:", {
        type: formData.connector_type,
        config: formData.connector_config
      });
      
      // Set loading state
      setIsSaving(true);
      
      // Remove option_type before sending to parent component
      const { option_type, ...taskData } = formData;

      // Ensure we're passing all the required data, including connector_config
      const finalTaskData: Task = {
        ...task, // Start with original task data
        ...taskData, // Override with updated fields (includes connector_config)
      };

      try {
        onSave(finalTaskData);
        // Note: We don't set isSaving back to false here because the component will unmount
        // when the modal closes
      } catch (error) {
        console.error("Error saving task:", error);
        setIsSaving(false);
      }
    } else {
      console.log("TaskForm - Validation failed, not submitting");
    }
  };

  // Helper function to render connector config fields
  const renderConnectorConfigFields = () => {
    if (!formData.connector_type) return null;

    // Initialize config if it doesn't exist for the selected type
    // This prevents errors when accessing properties of undefined
    let config = formData.connector_config as any; // Use 'as any' for easier access, or type guards
    if (!config) {
      // Initialize based on type - this helps with controlled inputs
      switch (formData.connector_type) {
        case ConnectorType.EMAIL: config = { fromEmail: '', email: '', subject: '' }; break;
        case ConnectorType.MESSAGE_QUEUE: config = { queuePath: '' }; break;
        case ConnectorType.WEB_SERVICE: config = { serviceType: ServiceType.REST, endPoint: '', responseTag: '' }; break;
        case ConnectorType.DATABASE: config = { databaseType: '', connectionString: '', queryType: QueryType.SELECT, query: '' }; break;
        default: return null;
      }
      // Update state immediately if config was missing
      // Note: This might cause an extra render, consider alternative approaches if performance is critical
      // setFormData(prev => ({ ...prev, connector_config: config }));
    }


    switch (formData.connector_type) {
      case ConnectorType.EMAIL:
        const emailConfig = config as EmailConnectorConfig;
        return (
          <>
            <div className="col-span-2">
              <label htmlFor="connector_config.fromEmail" className="block text-sm font-medium text-gray-700">From Email</label>
              <input type="email" id="connector_config.fromEmail" name="connector_config.fromEmail" value={emailConfig?.fromEmail || ''} onChange={handleChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.fromEmail'] ? 'border-red-500' : ''}`} />
              {errors['connector_config.fromEmail'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.fromEmail']}</p>}
            </div>
            <div className="col-span-2">
              <label htmlFor="connector_config.email" className="block text-sm font-medium text-gray-700">To Email</label>
              <input type="email" id="connector_config.email" name="connector_config.email" value={emailConfig?.email || ''} onChange={handleChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.email'] ? 'border-red-500' : ''}`} />
              {errors['connector_config.email'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.email']}</p>}
            </div>
            <div className="col-span-2">
              <label htmlFor="connector_config.subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input type="text" id="connector_config.subject" name="connector_config.subject" value={emailConfig?.subject || ''} onChange={handleChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.subject'] ? 'border-red-500' : ''}`} />
              {errors['connector_config.subject'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.subject']}</p>}
            </div>
          </>
        );
      case ConnectorType.MESSAGE_QUEUE:
        const mqConfig = config as MessageQueueConnectorConfig;
        return (
          <div className="col-span-2">
            <label htmlFor="connector_config.queuePath" className="block text-sm font-medium text-gray-700">Queue Path</label>
            <input type="text" id="connector_config.queuePath" name="connector_config.queuePath" value={mqConfig?.queuePath || ''} onChange={handleChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.queuePath'] ? 'border-red-500' : ''}`} />
            {errors['connector_config.queuePath'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.queuePath']}</p>}
          </div>
        );
      case ConnectorType.WEB_SERVICE:
        const wsConfig = config as WebServiceConnectorConfig;
        return (
          <>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="connector_config.serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
              <select id="connector_config.serviceType" name="connector_config.serviceType" value={wsConfig?.serviceType || ServiceType.REST} onChange={handleChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.serviceType'] ? 'border-red-500' : ''}`}>
                <option value={ServiceType.REST}>REST</option>
                <option value={ServiceType.SOAP}>SOAP</option>
              </select>
              {errors['connector_config.serviceType'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.serviceType']}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="connector_config.responseTag" className="block text-sm font-medium text-gray-700">Response Tag (Optional)</label>
              <input type="text" id="connector_config.responseTag" name="connector_config.responseTag" value={wsConfig?.responseTag || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="col-span-2">
              <label htmlFor="connector_config.endPoint" className="block text-sm font-medium text-gray-700">Endpoint URL</label>
              <input type="url" id="connector_config.endPoint" name="connector_config.endPoint" value={wsConfig?.endPoint || ''} onChange={handleChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.endPoint'] ? 'border-red-500' : ''}`} />
              {errors['connector_config.endPoint'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.endPoint']}</p>}
            </div>
          </>
        );
      case ConnectorType.DATABASE:
        const dbConfig = config as DatabaseConnectorConfig;
        return (
          <>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="connector_config.databaseType" className="block text-sm font-medium text-gray-700">Database Type</label>
              <input type="text" id="connector_config.databaseType" name="connector_config.databaseType" placeholder="e.g., SQL Server" value={dbConfig?.databaseType || ''} onChange={handleChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.databaseType'] ? 'border-red-500' : ''}`} />
              {errors['connector_config.databaseType'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.databaseType']}</p>}
            </div>
             <div className="col-span-2 sm:col-span-1">
              <label htmlFor="connector_config.queryType" className="block text-sm font-medium text-gray-700">Query Type</label>
              <select id="connector_config.queryType" name="connector_config.queryType" value={dbConfig?.queryType || QueryType.SELECT} onChange={handleChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.queryType'] ? 'border-red-500' : ''}`}>
                <option value={QueryType.SELECT}>SELECT</option>
                <option value={QueryType.INSERT}>INSERT</option>
                <option value={QueryType.UPDATE}>UPDATE</option>
                <option value={QueryType.DELETE}>DELETE</option>
              </select>
              {errors['connector_config.queryType'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.queryType']}</p>}
            </div>
            <div className="col-span-2">
              <label htmlFor="connector_config.connectionString" className="block text-sm font-medium text-gray-700">Connection String</label>
              <input type="text" id="connector_config.connectionString" name="connector_config.connectionString" value={dbConfig?.connectionString || ''} onChange={handleChange} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.connectionString'] ? 'border-red-500' : ''}`} />
              {errors['connector_config.connectionString'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.connectionString']}</p>}
            </div>
            <div className="col-span-2">
              <label htmlFor="connector_config.query" className="block text-sm font-medium text-gray-700">Query</label>
              <textarea id="connector_config.query" name="connector_config.query" value={dbConfig?.query || ''} onChange={handleChange} rows={4} required className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors['connector_config.query'] ? 'border-red-500' : ''}`} />
              {errors['connector_config.query'] && <p className="mt-1 text-sm text-red-500">{errors['connector_config.query']}</p>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleConnectorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newConnectorType = e.target.value as ConnectorType;
    console.log(`TaskForm - Connector type changed to: ${newConnectorType}`);
    
    // Create default config for the selected connector type
    let defaultConfig = {} as ConnectorConfig;
    
    switch (newConnectorType) {
      case ConnectorType.EMAIL:
        defaultConfig = { 
          serviceType: 'SMTP',
          smtpServer: '',
          port: 587,
          username: '',
          password: '',
          fromEmail: '',
          email: '',
          subject: '',
          body: ''
        } as EmailConnectorConfig;
        break;
      case ConnectorType.WEB_SERVICE:
        defaultConfig = {
          serviceType: 'REST',
          method: 'GET',
          endPoint: '',
          headers: '',
          body: ''
        } as WebServiceConnectorConfig;
        break;
      // Add other connector types as needed
    }
    
    console.log(`TaskForm - Setting default config for ${newConnectorType}:`, defaultConfig);
    
    setFormData(prev => ({
      ...prev,
      connector_type: newConnectorType,
      connector_config: defaultConfig
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Common Fields - Always visible */}
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Task Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Task Type - Always visible */}
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Task Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value={TaskType.INPUT}>Input</option>
            <option value={TaskType.LOGIC}>Logic</option>
            <option value={TaskType.OUTPUT}>Output</option>
          </select>
        </div>

        {/* Description - Always visible */}
        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Sequence Number - Always visible */}
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="sequence_number" className="block text-sm font-medium text-gray-700">
            Sequence Number
          </label>
          <input
            type="number"
            id="sequence_number"
            name="sequence_number"
            value={formData.sequence_number || 10}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Input Source - Visible only for Input tasks */}
        {formData.type === TaskType.INPUT && (
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="input_source" className="block text-sm font-medium text-gray-700">
              Input Source <span className="text-red-500">*</span>
            </label>
            <select
              id="input_source"
              name="input_source"
              value={formData.input_source || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.input_source ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select Input Source</option>
              <option value={InputSource.FILE}>File</option>
              <option value={InputSource.TEXT}>Text</option>
            </select>
            {errors.input_source && <p className="mt-1 text-sm text-red-500">{errors.input_source}</p>}
          </div>
        )}

        {/* Connector Type - Visible for Input and Output tasks */}
        {(formData.type === TaskType.INPUT || formData.type === TaskType.OUTPUT) && (
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="connector_type" className="block text-sm font-medium text-gray-700">
              Connector Type <span className="text-red-500">*</span>
            </label>
            <select
              id="connector_type"
              name="connector_type"
              value={formData.connector_type || ''}
              onChange={handleConnectorTypeChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.connector_type ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select Connector Type</option>
              <option value={ConnectorType.EMAIL}>Email</option>
              <option value={ConnectorType.MESSAGE_QUEUE}>Message Queue</option>
              <option value={ConnectorType.WEB_SERVICE}>Web Service</option>
              <option value={ConnectorType.DATABASE}>Database</option>
              <option value={ConnectorType.FILE}>File</option>
            </select>
            {errors.connector_type && <p className="mt-1 text-sm text-red-500">{errors.connector_type}</p>}
          </div>
        )}

        {/* --- Dynamic Connector Configuration Section --- */}
        { (formData.type === TaskType.INPUT || formData.type === TaskType.OUTPUT) && formData.connector_type && (
          <div className="col-span-2 border-t pt-4 mt-4">
             <h4 className="text-md font-medium text-gray-800 mb-3">Connector Configuration ({formData.connector_type})</h4>
             <div className="grid grid-cols-2 gap-4">
                {renderConnectorConfigFields()}
                {errors.connector_config && <p className="col-span-2 mt-1 text-sm text-red-500">{errors.connector_config}</p>}
             </div>
          </div>
        )}

        {/* Logic Type - Visible for Logic tasks */}
        {formData.type === TaskType.LOGIC && (
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="logic_type" className="block text-sm font-medium text-gray-700">
              Logic Type <span className="text-red-500">*</span>
            </label>
            <select
              id="logic_type"
              name="logic_type"
              value={formData.logic_type || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.logic_type ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select Logic Type</option>
              <option value={LogicType.UNIQUE_FILTER}>Unique Filter</option>
              <option value={LogicType.TRANSFORMATION}>Transformation</option>
              <option value={LogicType.RECORD_FILTER}>Record Filter</option>
            </select>
            {errors.logic_type && <p className="mt-1 text-sm text-red-500">{errors.logic_type}</p>}
          </div>
        )}

        {/* Option Type - Visible for Input/Output tasks */}
        {(formData.type === TaskType.INPUT || formData.type === TaskType.OUTPUT) && (
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="option_type" className="block text-sm font-medium text-gray-700">
              Option Type
            </label>
            <select
              id="option_type"
              name="option_type"
              value={formData.option_type || OptionTypeEnum.NONE}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value={OptionTypeEnum.NONE}>None</option>
              <option value={OptionTypeEnum.DATE_TIME_INCREMENTAL}>DateTime Incremental</option>
              <option value={OptionTypeEnum.UNIQUE_ID_INCREMENTAL}>UniqueID Incremental</option>
            </select>
          </div>
        )}

        {/* Input field - Visible for Input and Logic tasks */}
        {(formData.type === TaskType.INPUT || formData.type === TaskType.LOGIC) && (
          <div className="col-span-2">
            <label htmlFor="input" className="block text-sm font-medium text-gray-700">
              Input
            </label>
            <textarea
              id="input"
              name="input"
              value={formData.input || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        )}

        {/* Response field - Visible for Logic and Output tasks */}
        {(formData.type === TaskType.LOGIC || formData.type === TaskType.OUTPUT) && (
          <div className="col-span-2">
            <label htmlFor="response" className="block text-sm font-medium text-gray-700">
              Response
            </label>
            <textarea
              id="response"
              name="response"
              value={formData.response || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        )}

        {/* Save Input checkbox - Visible for all task types */}
        <div className="col-span-2 flex items-center">
          <input
            id="save_input"
            name="save_input"
            type="checkbox"
            checked={!!formData.save_input}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="save_input" className="ml-2 block text-sm text-gray-700">
            Save Input
          </label>
        </div>

        {/* Enabled checkbox - Always visible */}
        <div className="col-span-2 flex items-center">
          <input
            id="enabled"
            name="enabled"
            type="checkbox"
            checked={formData.enabled !== false}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
            Enabled
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-3 border-t">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            isSaving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={(e) => {
            // This is a safeguard in case the form submit event isn't working properly
            console.log("TaskForm - Save button clicked directly");
          }}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  )
}

export default TaskForm 