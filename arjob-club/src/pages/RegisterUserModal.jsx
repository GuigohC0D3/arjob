import { useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import RegisterUser from "./RegisterUser";
import PropTypes from "prop-types";

const RegisterUserModal = ({ visible, onHide }) => {
  const toast = useRef(null);

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Registro de Novo Usuário"
        visible={visible}
        onHide={onHide}
        modal
        draggable={false}
        resizable={false}
        style={{ width: "50vw", maxWidth: "600px" }}
      >
        <RegisterUser toast={toast} onClose={onHide} />
      </Dialog>
    </>
  );
};

RegisterUserModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};

export default RegisterUserModal;
