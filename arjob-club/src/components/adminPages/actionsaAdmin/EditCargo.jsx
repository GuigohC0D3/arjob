import { useState, useEffect } from "react";
import PropTypes from "prop-types"; 
import api from "../../../apiConfig";

const EditCargo = ({ userId, currentCargo, onClose, onUpdate }) => {
  const [selectedCargo, setSelectedCargo] = useState(currentCargo);
  const [cargos, setCargos] = useState([]);

  useEffect(() => {
    const fetchCargos = async () => {
      try {
        const response = await api.get("/admin/cargos");
        setCargos(response.data);
      } catch (error) {
        console.error("Erro ao carregar cargos:", error);
      }
    };

    fetchCargos();
  }, []);

  const handleSave = async () => {
    try {
      await api.put(`/admin/usuarios/${userId}/cargo`, { cargo_id: selectedCargo });
      onUpdate(); 
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar cargo:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Editar Cargo</h2>
        <select
          value={selectedCargo}
          onChange={(e) => setSelectedCargo(Number(e.target.value))}
          className="border px-4 py-2 rounded-md w-full"
        >
          {cargos.map((cargo) => (
            <option key={cargo.id} value={cargo.id}>
              {cargo.nome}
            </option>
          ))}
        </select>
        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">
            Cancelar
          </button>
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Adicionando validação das props
EditCargo.propTypes = {
  userId: PropTypes.number.isRequired,       // Deve ser um número e obrigatório
  currentCargo: PropTypes.number.isRequired, // Deve ser um número e obrigatório
  onClose: PropTypes.func.isRequired,        // Deve ser uma função e obrigatório
  onUpdate: PropTypes.func.isRequired,       // Deve ser uma função e obrigatório
};

export default EditCargo;
