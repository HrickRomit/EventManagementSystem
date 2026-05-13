import { useEffect, useRef, useState } from "react";
import { verifyTicket } from "../../services/events";

function CheckInPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);
  const [qrPayload, setQrPayload] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scanMessage, setScanMessage] = useState("");

  useEffect(
    () => () => {
      stopScanner();
    },
    []
  );

  const stopScanner = () => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsScanning(false);
  };

  const startScanner = async () => {
    setError("");
    setScanMessage("");

    if (!("BarcodeDetector" in window)) {
      setScanMessage("Camera QR scanning is not supported in this browser. Paste the QR payload instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsScanning(true);

      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          return;
        }

        const codes = await detector.detect(videoRef.current);

        if (codes[0]?.rawValue) {
          setQrPayload(codes[0].rawValue);
          setScanMessage("QR payload captured. Press Check In to verify.");
          stopScanner();
        }
      }, 800);
    } catch (_error) {
      setScanMessage("Camera access was not available. Paste the QR payload instead.");
      stopScanner();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsChecking(true);
    setResult(null);
    setError("");

    try {
      const { data } = await verifyTicket(qrPayload.trim());
      setResult(data.registration);
      setQrPayload("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not verify this ticket.");
      setResult(requestError.response?.data?.registration || null);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section className="event-workspace">
      <div className="event-workspace-header">
        <div>
          <p className="dashboard-card-kicker">Attendance</p>
          <h2>QR Check-In</h2>
          <p className="manage-users-copy">Paste the QR ticket payload from an attendee ticket to verify and check them in.</p>
        </div>
      </div>

      <form className="checkin-panel" onSubmit={handleSubmit}>
        <div className="checkin-scanner">
          <video ref={videoRef} className="checkin-video" muted playsInline />
          <div className="checkin-scanner-actions">
            <button className="btn-cancel" type="button" onClick={isScanning ? stopScanner : startScanner}>
              {isScanning ? "Stop Camera" : "Scan QR"}
            </button>
            {scanMessage ? <span>{scanMessage}</span> : null}
          </div>
        </div>
        <label className="form-group">
          <span>QR ticket payload</span>
          <textarea
            value={qrPayload}
            onChange={(event) => setQrPayload(event.target.value)}
            placeholder='{"registrationId":"...","eventId":"...","ticketId":"...","token":"..."}'
            required
          />
        </label>
        <button className="btn-submit" type="submit" disabled={isChecking}>
          {isChecking ? "Checking..." : "Check In"}
        </button>
      </form>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {result ? (
        <article className="dashboard-card checkin-result-card">
          <p className="dashboard-card-kicker">Ticket result</p>
          <h3>{result.eventName}</h3>
          <dl>
            <div>
              <dt>Participant</dt>
              <dd>{result.participant?.name || "Participant"}</dd>
            </div>
            <div>
              <dt>Ticket ID</dt>
              <dd>{result.ticketId}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{result.attendanceStatus === "checked_in" ? "Checked in" : "Not checked in"}</dd>
            </div>
            <div>
              <dt>Checked in at</dt>
              <dd>{result.checkedInAt ? new Date(result.checkedInAt).toLocaleString() : "-"}</dd>
            </div>
          </dl>
        </article>
      ) : null}
    </section>
  );
}

export default CheckInPage;
