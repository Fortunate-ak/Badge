import { useState } from "react";

function useForm<T extends Record<string, any>>(initial: T) {
  const [values, setValues] = useState(initial);

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    setValues({ ...values, [e.target.name]: e.target.value });
  }

  return { values, handleChange, setValues };
}

export default useForm;


/*
// usage
const LoginForm = () => {
  const { values, handleChange } = useForm({ email: "", password: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      <input name="password" value={values.password} onChange={handleChange} />
      <button>Login</button>
    </form>
  );
};
*/