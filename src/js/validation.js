import * as yup from 'yup';


// f для перевода



const schema = yup.object({
  url: yup.string()
    .url('Ссылка должна быть валидным URL')
    .required('Поле не должно быть пустым'),
});

const validate = (field) => {
  try {
    schema.validateSync(field);
  } catch (e) {
    return e.errors;
  }
  return [];
};

export default validate;
