import React, { useState } from 'react';
import { ProcessSchedule, Recurrence } from '../../types';

interface TriggerFormProps {
  schedule?: ProcessSchedule;
  onSave: (schedule: ProcessSchedule) => void;
  onCancel: () => void;
}

const TriggerForm: React.FC<TriggerFormProps> = ({ schedule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProcessSchedule>(
    schedule || {
      enabled: true,
      recurrence: Recurrence.DAILY,
      time: '00:00',
      daysOfWeek: [],
      daysOfMonth: [],
      months: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      updatedAt: new Date().toISOString()
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-medium mb-4">Schedule Configuration</h2>
        
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
              value={formData.time || '00:00'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
            />
          </div>
          
          {formData.recurrence !== Recurrence.ONCE && (
            <>
              {formData.recurrence === Recurrence.WEEKLY && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days of Week
                  </label>
                  <input
                    type="text"
                    name="daysOfWeek"
                    value={formData.daysOfWeek?.join(',') || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      daysOfWeek: e.target.value.split(',').map(day => day.trim())
                    }))}
                    placeholder="e.g. MON,TUE,WED"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
                  />
                </div>
              )}

              {formData.recurrence === Recurrence.MONTHLY && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days of Month
                  </label>
                  <input
                    type="text"
                    name="daysOfMonth"
                    value={formData.daysOfMonth?.join(',') || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      daysOfMonth: e.target.value.split(',').map(day => parseInt(day.trim()))
                    }))}
                    placeholder="e.g. 1,15,30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-main hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TriggerForm; 