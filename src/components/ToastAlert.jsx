export default function ToastAlert({ message, type }) {
  if (!message) return null;
  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}> 
      {message}
    </div>
  );
}
