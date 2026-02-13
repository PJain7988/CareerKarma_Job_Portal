import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useParams, Link } from "react-router-dom";

export default function JobDetail(){
  const { id } = useParams();
  const [job,setJob] = useState(null);

  useEffect(()=>{
    (async ()=>{
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data);
    })();
  },[id]);

  if(!job) return <div className="container py-10">Loading...</div>;

  return (
    <div className="container py-10">
      <div className="card">
        <h1 className="text-2xl font-semibold">{job.title}</h1>
        <div className="text-sm text-gray-600">{job.company} • {job.location}</div>
        <p className="mt-4 whitespace-pre-wrap">{job.description}</p>
        <div className="mt-2 text-sm">Skills: {job.skills?.join(", ")}</div>
        <Link to={`/apply/${job._id}`} className="btn btn-primary mt-4 inline-block">Apply Now</Link>
      </div>
    </div>
  );
}
