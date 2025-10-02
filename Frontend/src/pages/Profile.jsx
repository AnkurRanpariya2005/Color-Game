import { useState } from "react";

import { useSelector } from "react-redux";
export default function Profile() {
  const {user} = useSelector((state) => state.user);

  const [email] = useState(user?.email || "");

  return (
    <div className="profile">
      <div className="col">
        <div className="card col">
          <h2>Profile</h2>
          <div>Email: {email}</div>
          <label>Avatar URL</label>
        </div>
        <div className="card row" style={{ justifyContent: "space-between" }}>
          <div>Balance: {user.balance.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
