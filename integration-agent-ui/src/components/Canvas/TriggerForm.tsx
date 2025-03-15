import React, { useState } from 'react';
import { ProcessSchedule, Recurrence } from '../../types';

interface TriggerFormProps {
  schedule?: ProcessSchedule;
  onSubmit: (schedule: ProcessSchedule) => void;
  onCancel: () => void;
}

const TriggerForm: React.FC<TriggerFormProps> = ({ schedule, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ProcessSchedule>(
    schedule || {
      recurrence: Recurrence.Daily,
      time: '00:00',
      days: '',
      interval: 0,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Configure Trigger</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recurrence
          </label>
          <select
            name="recurrence"
            value={formData.recurrence}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
          >
            {Object.values(Recurrence).map(value => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
          />
        </div>
        
        {formData.recurrence !== Recurrence.Once && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days
            </label>
            <input
              type="text"
              name="days"
              value={formData.days || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
            />
          </div>
        )}
        
        {formData.recurrence === Recurrence.Interval && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interval (minutes)
            </label>
            <input
              type="number"
              name="interval"
              value={formData.interval || 0}
              onChange={handleChange}
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-main border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default TriggerForm; 