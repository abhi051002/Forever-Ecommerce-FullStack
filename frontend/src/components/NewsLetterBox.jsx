const NewsLetterBox = () => {
  const onSubmitHandler = () => {
    event.preventDefault();
    
  };
  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe Now & get 20% off
      </p>
      <p className="text-gray-400 mt-3">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda,
        minus.
      </p>
      <form
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
        onSubmit={onSubmitHandler}
      >
        <input
          type="email"
          placeholder="Enter Your Email."
          className="w-full sm:flex-1 outline-none"
          required
        />
        <button
          type="submit"
          className="bg-black text-white text-sm px-10 py-4"
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
};

export default NewsLetterBox;
