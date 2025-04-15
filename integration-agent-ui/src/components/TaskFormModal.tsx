import React from 'react'
import { Task } from '../types'
import TaskForm from './TaskForm'

interface TaskFormModalProps {
  isOpen: boolean
  task: Task
  onSave: (task: Task) => void
  onClose: () => void
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, task, onSave, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex justify-between items-center pb-3 border-b mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {task.id ? 'Edit Task' : 'Add New Task'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Do NOT wrap TaskForm in a <form> element, as TaskForm already has one */}
          <TaskForm task={task} onSave={onSave} onCancel={onClose} />
        </div>
      </div>
    </div>
  )
}

export default TaskFormModal 