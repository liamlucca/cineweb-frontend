import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { REPORT_REASONS } from "../types/index.ts"
import type { ReportReason } from "../types/index.ts"
import "../styles/ReportPage.css";

export default function ReportPage() {
  const navigate = useNavigate()

  //holds the selected option
  const [selectedReason, setSelectedReason] = useState<ReportReason | "">("")
  
  //when the user selects "Other" - holds the description
  const [otherReasonDescription, setOtherReasonDescription] = useState("")

  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // a reason is required, and "Other" also needs its description
  const canSave = selectedReason !== ""
    && (selectedReason !== "Other" || otherReasonDescription.trim() !== "")

  //opens the confirmation box
  const saveReport = () => {
    setShowSaveConfirmation(true);
  }
  //confirms save - the backend call would go here
  const confirmSaveReport = () => {
    console.log({
      selectedReason,
      otherReasonDescription
    });

    setShowSaveConfirmation(false);
  }

  return (
    <div className="report-section">
      
      <h1 className="report-title">
        Report:
      </h1>

      {/*options */}
      <div>
        {REPORT_REASONS.map((m) => (
          <label className="report-options" key={m}>
            {m}

            <input
              type="radio" //only allows one to be selected
              name="reason"
              value={m}
              checked={selectedReason === m}
              onChange={() => setSelectedReason(m)} //stores the value on click
            />
          </label>
        ))}
      </div>

      {/*if "Other" is selected */}
      {selectedReason === "Other" && (
        <div className="other-reason">
          <textarea 
            className="other-reason-textarea"
            placeholder="Write the reason..."
            value={otherReasonDescription}
            onChange={(e) => setOtherReasonDescription(e.target.value)}
          />
        </div>
      )}

      {/*main buttons*/}
      <div className="main-buttons">
        
        <button
          className="close-report-button"
          onClick={() => navigate("/")}
        >
          Close
        </button>

        <button
          type="button"
          className="save-report-button"
          onClick={saveReport}
          disabled={!canSave}
        >
          Save
        </button>

      </div>

      {/*confirmation box */}
      {showSaveConfirmation && (
        <div className="modal-backdrop">
          <div className="modal-box">

            <p className="confirm-text">Do you want to save the report?</p>

            <div className="confirm-buttons">

              <button 
                className="cancel-save-button" 
                // only closes the box, so the user can still change the report
                onClick={() => setShowSaveConfirmation(false)}
              >
                Cancel
              </button>

              <button 
                className="confirm-save-button" 
                onClick={() => {
                  confirmSaveReport();
                  navigate("/");
                }}
              >
                Save
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}
