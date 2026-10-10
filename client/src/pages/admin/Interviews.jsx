import { useEffect, useState } from "react";
import { FiArrowLeft, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

const Interviews = () => {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    difficulty: "medium",
    duration: 30,
  });

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  // =====================================================
  // Load Interviews and Categories
  // =====================================================
  const loadData = async () => {
    try {
      const [interviewRes, categoryRes] = await Promise.allSettled([
        api.get("/interview/all-interviews?limit=20", config),
        api.get("/categories/all-categories", config),
      ]);

      // =================================================
      // Interviews API
      // =================================================
      if (interviewRes.status === "fulfilled") {
        setInterviews(
          interviewRes.value.data?.interviews || []
        );
      } else {
        console.log(
          "Interview API Error:",
          interviewRes.reason?.response?.data || interviewRes.reason
        );

        setInterviews([]);
      }

      // =================================================
      // Categories API
      // =================================================
      if (categoryRes.status === "fulfilled") {
        setCategories(
          categoryRes.value.data?.categories || []
        );
      } else {
        console.log(
          "Category API Error:",
          categoryRes.reason?.response?.data || categoryRes.reason
        );

        setCategories([]);
      }

      // Show error only if both APIs fail
      if (
        interviewRes.status === "rejected" &&
        categoryRes.status === "rejected"
      ) {
        toast.error(
          interviewRes.reason?.response?.data?.msg ||
            categoryRes.reason?.response?.data?.msg ||
            "Unable to load data"
        );
      }
    } catch (error) {
      console.log("Load Data Error:", error);

      toast.error(
        error?.response?.data?.msg || "Unable to load data"
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // Handle Input Change
  // =====================================================
  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // Reset Form
  // =====================================================
  const resetForm = () => {
    setEditing(null);

    setForm({
      title: "",
      description: "",
      categoryId: "",
      difficulty: "medium",
      duration: 30,
    });
  };

  // =====================================================
  // Add / Update Interview
  // =====================================================
  const save = async (e) => {
    e.preventDefault();

    try {
      // Title validation
      if (!form.title.trim()) {
        toast.error("Interview title is required");
        return;
      }

      // Category validation
      if (!form.categoryId) {
        toast.error("Please select a category");
        return;
      }

      // Description validation
      if (!form.description.trim()) {
        toast.error("Description is required");
        return;
      }

      if (form.description.trim().length < 10) {
        toast.error(
          "Description should be at least 10 characters"
        );
        return;
      }

      // Duration validation
      if (Number(form.duration) <= 0) {
        toast.error("Duration must be greater than 0");
        return;
      }

      // Prepare data
      const interviewData = {
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        difficulty: form.difficulty,
        duration: Number(form.duration),
      };

      // =================================================
      // Update
      // =================================================
      if (editing) {
        await api.put(
          `/interview/update/${editing}`,
          interviewData,
          config
        );

        toast.success("Interview updated successfully");
      }

      // =================================================
      // Add
      // =================================================
      else {
        await api.post(
          "/interview/add-interview",
          interviewData,
          config
        );

        toast.success("Interview added successfully");
      }

      resetForm();

      // Reload list
      await loadData();
    } catch (error) {
      console.log("Save Interview Error:", error);

      toast.error(
        error?.response?.data?.msg || "Operation failed"
      );
    }
  };

  // =====================================================
  // Delete Interview
  // =====================================================
  const remove = async (id) => {
    if (!window.confirm("Delete this interview?")) {
      return;
    }

    try {
      await api.delete(
        `/interview/delete/${id}`,
        config
      );

      toast.success("Interview deleted successfully");

      await loadData();
    } catch (error) {
      console.log("Delete Interview Error:", error);

      toast.error(
        error?.response?.data?.msg || "Delete failed"
      );
    }
  };

  // =====================================================
  // Edit Interview
  // =====================================================
  const edit = (item) => {
    setEditing(item._id);

    setForm({
      title: item.title || "",
      description: item.description || "",
      categoryId:
        item.categoryId?._id ||
        item.categoryId ||
        "",
      difficulty: item.difficulty || "medium",
      duration: item.duration || 30,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // JSX
  // =====================================================
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <FiArrowLeft />
          Dashboard
        </button>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold">
            Manage Interviews
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage mock interviews.
          </p>
        </div>

        {/* =================================================
            Add / Update Form
        ================================================= */}
        <form
          onSubmit={save}
          className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">

            {/* Interview Title */}
            <input
              name="title"
              value={form.title}
              onChange={change}
              placeholder="Interview title"
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            {/* Category */}
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={change}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">
                Select category
              </option>

              {categories.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.categoryName}
                </option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={change}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Duration */}
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={change}
              min="1"
              placeholder="Duration"
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            {/* Description */}
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              placeholder="Description"
              rows="3"
              className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="mt-4 flex gap-3">

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold hover:bg-indigo-500"
            >
              <FiPlus />

              {editing
                ? "Update Interview"
                : "Add Interview"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-800 px-5 py-3 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* =================================================
            Interview List
        ================================================= */}
        <div className="grid gap-5 md:grid-cols-2">

          {interviews.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
              <p className="text-slate-400">
                No interviews found.
              </p>

              <p className="mt-2 text-xs text-slate-600">
                Add an interview using the form above.
              </p>
            </div>
          ) : (
            interviews.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex items-start justify-between gap-3">

                  <h2 className="font-semibold">
                    {item.title}
                  </h2>

                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs capitalize text-indigo-400">
                    {item.difficulty}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <p className="mt-3 text-xs text-slate-600">
                  {item.categoryId?.categoryName ||
                    "General"}{" "}
                  • {item.duration} min
                </p>

                <div className="mt-5 flex gap-2">

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => edit(item)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-sm hover:bg-slate-700"
                  >
                    <FiEdit2 />
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => remove(item._id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <FiTrash2 />
                  </button>

                </div>
              </div>
            ))
          )}

        </div>
      </main>
    </div>
  );
};

export default Interviews;