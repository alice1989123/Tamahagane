import {
    FormControl,
    FormLabel,
    FormErrorMessage, Button , Input
  } from '@chakra-ui/react'

import { Formik , Form, Field } from 'formik';
import {sell} from "../cardano/wallet"

export default function SaleForm(selectedAsset) {


    function validatePrice(value) {
      let error
      if (!value) {
        error = 'Price is required'
      } 
       
      
      else if (value <2 ) {
        error = 'Price must be higher than 2 ADA'
      }
      return error
    }
  
    return (
      <Formik
        initialValues={{ name: 2  }}
        onSubmit={async (values , actions) => {
            const confirmation = await sell(selectedAsset, values.price * 1000000);
            actions.setSubmitting(false)
            setConfirmation(confirmation);
            alert(JSON.stringify(values, null, 2))
          }}
        
      >
        {(props) => (
          <Form>
            <Field name='price' validate={validatePrice}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.name && form.touched.name}>
                  <FormLabel htmlFor='price'>Price for listing</FormLabel>
                  <Input {...field} id='price' placeholder='price' type="number"  />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Button
              mt={4}
              colorScheme='teal'
              isLoading={props.isSubmitting}
              type='submit'
            >
              List for Sale
            </Button>
          </Form>
        )}
      </Formik>
    )
  }

