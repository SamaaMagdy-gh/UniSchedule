import React from "react";
import "../../Styles/teacher/ScheduleTable.css";

const ScheduleTable = ({ schedule, deleteCourse }) => {
  return (
    <div className="table-container">
      <table className="main-table">
        <thead className="table-header">
          <tr>
            <th>Course</th>
            <th>Day</th>
            <th>Duration</th>
            <th style={{ textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item) => (
            <tr key={item.id} className="table-row">
              <td className="cell-course">{item.course}</td>
              <td className="cell-day">{item.day}</td>
              <td className="cell-time">{item.time}</td>
              <td style={{ textAlign: 'center' }}>
                <button className="btn-delete" onClick={() => deleteCourse(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {schedule.length === 0 && <div className="empty-msg">No classes scheduled yet.</div>}
    </div>
  );
};

export default ScheduleTable;