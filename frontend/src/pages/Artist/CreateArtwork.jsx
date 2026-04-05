import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Camera,
  Tag,
  DollarSign,
  Type,
  AlignLeft,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const CreateArtwork = () => {
  const [status, setStatus] = useState({ message: "", type: "" });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      image: null,
      price: "",
      tags: "",
    },

    validationSchema: Yup.object({
      title: Yup.string()
        .min(3, "Title must be at least 3 characters")
        .required("Title is required"),

      description: Yup.string()
        .min(10, "Description must be at least 10 characters")
        .required("Description is required"),

      price: Yup.number()
        .typeError("Price must be a number")
        .positive("Price must be positive")
        .required("Price is required"),

      tags: Yup.string().required("Tags are required"),

      image: Yup.mixed().required("Image is required"),
    }),

    onSubmit: (values, { resetForm }) => {
      console.log(values);

      setStatus({
        message: "Artwork created successfully!",
        type: "success",
      });

      resetForm();
    },
  });

  const inputClasses =
    "w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-11 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-white/20 focus:border-white/40 transition-all outline-none";

  const labelClasses =
    "block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 ml-1";

  const iconClasses = "absolute left-3.5 top-[38px] text-zinc-600 h-5 w-5";

  const errorText = "text-rose-400 text-xs mt-1 ml-1";

  return (
    <div className="min-h-screen text-zinc-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-tighter text-white mb-2">
            COLLECTION <span className="font-serif italic">Entry</span>
          </h1>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          <form onSubmit={formik.handleSubmit} className="space-y-6">

            {/* Title */}
            <div className="relative">
              <label className={labelClasses}>Artwork Title</label>
              <Type className={iconClasses} />

              <input
                type="text"
                name="title"
                placeholder="The Eternal Horizon"
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
                placeholder="Describe the artwork..."
                className={`${inputClasses} resize-none`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
              />

              {formik.touched.description && formik.errors.description && (
                <p className={errorText}>{formik.errors.description}</p>
              )}
            </div>

            {/* Image */}
            <div className="relative">
              <label className={labelClasses}>Image</label>
              <Camera className={iconClasses} />

              <input
                type="file"
                name="image"
                className={inputClasses}
                onChange={(event) =>
                  formik.setFieldValue("image", event.currentTarget.files[0])
                }
              />

              {formik.touched.image && formik.errors.image && (
                <p className={errorText}>{formik.errors.image}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Price */}
              <div className="relative">
                <label className={labelClasses}>Price</label>
                <DollarSign className={iconClasses} />

                <input
                  type="number"
                  name="price"
                  placeholder="2500"
                  className={inputClasses}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.price}
                />

                {formik.touched.price && formik.errors.price && (
                  <p className={errorText}>{formik.errors.price}</p>
                )}
              </div>

              {/* Tags */}
              <div className="relative">
                <label className={labelClasses}>Tags</label>
                <Tag className={iconClasses} />

                <input
                  type="text"
                  name="tags"
                  placeholder="oil, canvas, abstract"
                  className={inputClasses}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.tags}
                />

                {formik.touched.tags && formik.errors.tags && (
                  <p className={errorText}>{formik.errors.tags}</p>
                )}
              </div>
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
              CREATE ARTWORK
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateArtwork;