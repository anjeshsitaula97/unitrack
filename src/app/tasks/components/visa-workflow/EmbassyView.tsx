"use client";

import { Edit2, Building, MapPin, Phone, Mail, Globe, Clock } from "lucide-react";
import type { VisaWorkflowController } from "./useVisaWorkflow";

export default function EmbassyView({ workflow }: { workflow: VisaWorkflowController }) {
  const { country, visaType, embassyDetail, setShowEmbassyModal } = workflow;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Diplomatic Mission</h2>
          <p className="text-sm text-slate-500 mt-1">Contact details for {country} Consulate</p>
        </div>
        <button
          type="button"
          onClick={() => setShowEmbassyModal(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-[color,background-color,border-color,box-shadow,transform,opacity] flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Edit2 size={16} /> {embassyDetail ? "Modify Records" : "Setup Embassy"}
        </button>
      </div>

      {embassyDetail ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 size-96 bg-indigo-50/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 mb-12 pb-12 border-b border-slate-50">
            <div className="size-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100">
              <Building size={48} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">
                {embassyDetail.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {country}
                </span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {visaType} Mission
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {embassyDetail.address && (
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-[color,background-color,border-color,box-shadow,transform,opacity]">
                    <MapPin size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Headquarters
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-700 leading-relaxed pl-13">
                  {embassyDetail.address}
                </p>
              </div>
            )}
            {embassyDetail.phone && (
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-[color,background-color,border-color,box-shadow,transform,opacity]">
                    <Phone size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Direct Line
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-700 leading-relaxed">
                  {embassyDetail.phone}
                </p>
              </div>
            )}
            {embassyDetail.email && (
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-[color,background-color,border-color,box-shadow,transform,opacity]">
                    <Mail size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Official Email
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-700 leading-relaxed break-all">
                  {embassyDetail.email}
                </p>
              </div>
            )}
            {embassyDetail.website && (
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-[color,background-color,border-color,box-shadow,transform,opacity]">
                    <Globe size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Digital Portal
                  </p>
                </div>
                <a
                  href={
                    embassyDetail.website.startsWith("http")
                      ? embassyDetail.website
                      : `https://${embassyDetail.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg font-black text-indigo-600 hover:underline"
                >
                  {embassyDetail.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {embassyDetail.workingHours && (
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-[color,background-color,border-color,box-shadow,transform,opacity]">
                    <Clock size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Operation Hours
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-700 leading-relaxed">
                  {embassyDetail.workingHours}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-24 text-center shadow-inner relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-40 bg-indigo-50/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 size-40 bg-violet-50/50 rounded-full blur-3xl" />
          <div className="relative size-24 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50">
            <Building size={36} className="text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Mission Records Missing</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
            Add the diplomatic mission contact details to assist with the visa application process.
          </p>
          <button
            type="button"
            onClick={() => setShowEmbassyModal(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-[color,background-color,border-color,box-shadow,transform,opacity] shadow-lg shadow-indigo-100"
          >
            Configure Embassy
          </button>
        </div>
      )}
    </div>
  );
}
