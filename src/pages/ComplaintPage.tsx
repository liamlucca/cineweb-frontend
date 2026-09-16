//import { useState } from "react"
import { useNavigate } from "react-router-dom"

import "../styles/ComplaintPage.css";

import type { ComplaintUI } from "../types/index.ts"

export default function ComplaintPage() {
  const navigate = useNavigate()
  //const [show, setShow] = useState(true) 
  
  //placeholder data for the frontend for now
  const complaints: ComplaintUI[] = [
    {
      complaint_id: 1,
      media_id: 10,
      report_type: "Harassment and bullying",
      reported_user_id: 2,
      admin_id: 1,
      status: true,
      is_new: true,
      media_name: "Shrek 2",
    },
    {
      complaint_id: 2,
      media_id: 11,
      report_type: "Sexual content",
      reported_user_id: 3,
      admin_id: 1,
      status: true,
      is_new: false,
      media_name: "Euphoria",
    },
  ]

  //if (!show) return null
  
  return (
    <div className="modal-backdrop">
        <div className="modal-box">
          {
          //<button className="close-modal" onClick={() => setShow(false)}>
          //  x
          //</button>
          }
          <button className="close-modal" onClick={() => navigate("/")}>
            x
          </button>    
          <h2>Received Complaints</h2>

          {complaints.map((c) =>(
            <div key={c.complaint_id} className="complaint-card">

              <div className="complaint-title">
                <div className="complaint-text">
                  <span>
                     Received a complaint.<br></br>
                  </span>

                  <span>
                    Media: {c.media_name}
                  </span>
                </div>

                <span className={c.is_new ? "eye-blue":"eye-gray"} title={c.is_new ? "new" : "viewed"}>
                  👁
                </span>
              </div>

              <p className="complaint-reason">
                Reason: <b>{c.report_type}</b>
              </p>

              <button className="appeal-button" onClick={() => navigate("/")}>
                Appeal
              </button>
            </div>
          ))}
        </div>
    </div>
  )
}
