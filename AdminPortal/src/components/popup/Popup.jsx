
import "./Popup.css"
const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
  

    return (
      <div className="popup-container">
        <div className="popup">
          <p>{message}</p>
          <div className="popup-buttons">
            <button onClick={onCancel}>Cancel</button>
            <button data-dismiss="modal"
                         aria-label="Close"
                         onClick={onConfirm}>OK</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmationPopup;