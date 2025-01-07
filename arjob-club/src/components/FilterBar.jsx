import PropTypes from "prop-types";

const FilterBar = ({ categorias, onFilter }) => {
  return (
    <div className="categorias-container bg-gray-100 p-4 rounded shadow-md mt-2">
      <h4 className="mb-2">Filtrar por Categoria</h4>
      <ul className="flex flex-col gap-2">
        {/* Opção para "Todas" as categorias */}
        <li
          key="todas"
          className="cursor-pointer hover:text-blue-500"
          onClick={() => onFilter(null)}
        >
          Todas
        </li>

        {/* Renderiza as categorias dinamicamente */}
        {categorias.map((categoria, index) => (
          <li
            key={index}
            className="cursor-pointer hover:text-blue-500"
            onClick={() => onFilter(categoria)}
          >
            {categoria}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Definindo as PropTypes para garantir o uso correto do componente
FilterBar.propTypes = {
  categorias: PropTypes.arrayOf(PropTypes.string).isRequired, // Lista de categorias
  onFilter: PropTypes.func.isRequired, // Função chamada ao selecionar uma categoria
};

export default FilterBar;
