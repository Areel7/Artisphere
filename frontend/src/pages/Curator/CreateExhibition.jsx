import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Type,
  AlignLeft,
  Calendar,
  Image,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const CreateExhibition = () => {
  const [status, setStatus] = useState({ message: "", type: "" });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      artworkIds: "",
    },

    validationSchema: Yup.object({
      title: Yup.string()
        .min(3, "Title must be at least 3 characters")
        .required("Title is required"),

      description: Yup.string()
        .min(10, "Description must be at least 10 characters")
        .required("Description is required"),

      startDate: Yup.date().required("Start date is required"),

      endDate: Yup.date()
        .required("End date is required")
        .min(Yup.ref("startDate"), "End date must be after start date"),

      artworkIds: Yup.string().required("Artwork IDs are required"),
    }),

onSubmit: (values, { resetForm }) => {
      console.log(values);

      setStatus({
        message: "Exibition created successfully!",
        type: "success",
      });

      resetForm();
    },
  });

  const inputClasses =
    "w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-11 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none";

  const labelClasses =
    "block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 ml-1";

  const iconClasses = "absolute left-3.5 top-[38px] text-zinc-600 h-5 w-5";

  const errorText = "text-rose-400 text-xs mt-1 ml-1";

  return (
    <div className="min-h-screen text-zinc-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-tighter text-white">
            CREATE <span className="font-serif italic">EXHIBITION</span>
          </h1>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-6">

            {/* Title */}
            <div className="relative">
              <label className={labelClasses}>Title</label>
              <Type className={iconClasses} />

              <input
                type="text"
                name="title"
                placeholder="Modern Art Expo"
                className={inputClasses}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.title}
              />

              {formik.touched.title && formik.errors.title && (
                <p className={errorText}>{formik.errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="relative">
              <label className={labelClasses}>Description</label>
              <AlignLeft className={iconClasses} />

              <textarea
                name="description"
                rows="3"
                placeholder="Describe the exhibition..."
                className={`${inputClasses} resize-none`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
              />

              {formik.touched.description && formik.errors.description && (
                <p className={errorText}>{formik.errors.description}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="relative">
              <label className={labelClasses}>Start Date</label>
              <Calendar className={iconClasses} />

              <input
                type="date"
                name="startDate"
                className={inputClasses}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.startDate}
              />

              {formik.touched.startDate && formik.errors.startDate && (
                <p className={errorText}>{formik.errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div className="relative">
              <label className={labelClasses}>End Date</label>
              <Calendar className={iconClasses} />

              <input
                type="date"
                name="endDate"
                className={inputClasses}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.endDate}
              />

              {formik.touched.endDate && formik.errors.endDate && (
                <p className={errorText}>{formik.errors.endDate}</p>
              )}
            </div>

            {/* Artwork IDs */}
            <div className="relative">
              <label className={labelClasses}>Artwork IDs</label>
              <Image className={iconClasses} />

              <input
                type="text"
                name="artworkIds"
                placeholder="id1,id2,id3"
                className={inputClasses}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.artworkIds}
              />

              {formik.touched.artworkIds && formik.errors.artworkIds && (
                <p className={errorText}>{formik.errors.artworkIds}</p>
              )}
            </div>

            {/* Status */}
            {status.message && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
                  status.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {status.message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200"
            >
              CREATE EXHIBITION
              <Send size={18} />
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExhibition;