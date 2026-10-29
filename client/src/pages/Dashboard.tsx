import { useAppSelector } from "../store";

function Dashboard() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="mt-1 text-gray-500">
        {user?.role === "owner" ? "Here is an overview of your shop." : "Here are the orders assigned to you."}
      </p>
    </div>
  );
}

export default Dashboard;
