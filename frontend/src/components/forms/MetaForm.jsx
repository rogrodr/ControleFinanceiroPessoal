import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const MetaForm = ({ onSuccess, initialData, onCancel }) => {
  const { token } = useAuth()
  const [formData, setFormData] = useState(initialData || {
    description: '',
    targetAmount: '',
    category: '',
    currentAmount: '',
    deadline: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount || 0)
      }

      if (initialData) {
        await axios.put(`http://localhost:8080/api/metas/${initialData.id}`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } else {
        await axios.post('http://localhost:8080/api/metas', payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
      onSuccess()
    } catch (err) {
      setError('Erro ao salvar meta')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <input
          type="text"
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
          Valor Alvo (R$)
        </label>
        <input
          type="number"
          step="0.01"
          name="targetAmount"
          id="targetAmount"
          value={formData.targetAmount}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700">
          Valor Atual (R$)
        </label>
        <input
          type="number"
          step="0.01"
          name="currentAmount"
          id="currentAmount"
          value={formData.currentAmount}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
          Prazo
        </label>
        <input
          type="date"
          name="deadline"
          id="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Categoria
        </label>
        <select
          name="category"
          id="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        >
          <option value="">Selecione uma categoria</option>
          <option value="Viagem">Viagem</option>
          <option value="Educação">Educação</option>
          <option value="Compras">Compras</option>
          <option value="Investimento">Investimento</option>
          <option value="Outro">Outro</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

export default MetaForm