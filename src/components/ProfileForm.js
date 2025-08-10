const ProfileForm = ({ type, placeholder, value, onChange,className }) => {
  return (
    <form className='form'>
      <input
        type={type}
        placeholder={placeholder}
        value={value} // props로 넘겨받을
        onChange={onChange}
        className={className}
      />
      <div className='form-error-message'>안내메시지</div>
    </form>
  );
};

export default ProfileForm;