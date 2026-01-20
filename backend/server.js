import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.get("/todos/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);
  res.json(data);
});

app.post("/todos", async (req, res) => {
  const { task, user_id } = req.body;

  const { data, error } = await supabase
    .from("todos")
    .insert([{ task, user_id }]);

  if (error) return res.status(500).json(error);
  res.json(data);
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  const { error } = await supabase
    .from("todos")
    .update({
      task,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) return res.status(500).json(error);
  res.json({ success: true });
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id);

  if (error) return res.status(500).json(error);
  res.json({ success: true });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
