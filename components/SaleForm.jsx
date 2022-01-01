import { HStack,
    FormControl,
    FormLabel,
    FormErrorMessage, Button , Input
  } from '@chakra-ui/react'
  import  BuyMessageModal  from "../components/BuyMessageModal";
  import { useState } from 'react';
  import { registerSell } from '../cardano/apiServerCalls';


import { Formik , Form, Field , useFormik} from 'formik';
import {sell} from "../cardano/wallet"
export default function SellingForm(  {toSell , address}) {

  const [confirmation, setConfirmation] = useState(false);

  function validateName(value) {
    let error
    if (!value) {
      error = 'Price is required'
    } 
   
    return error
  }

  return (
    <><Formik
      initialValues={{ name: '' }}
      onSubmit={async (values, actions) => {

        const priceLovelaces = values.name * 1000000
        console.log(toSell.unit);
        console.log(toSell.quantity);
        console.log(values.name);

        try{
        const confirmation = await sell(toSell,priceLovelaces);
        const sellregistration = await registerSell(
          toSell.unit,
          priceLovelaces,
          address
        
        );
        setConfirmation(confirmation);

        actions.setSubmitting(false);
        }catch(e){
          console.log(e)
        }

      } }
    >
      {(props) => (
        <Form  >
          <HStack   spacing='2rem'  alignItems='center'>
            
          <Field name='name' validate={validateName}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.name && form.touched.name}>
                <FormLabel htmlFor='name' id={'unique1d12323235321'} // TODO: put a uniqueId
                >Price for listing</FormLabel>
                <Input {...field} id='name' placeholder='Price' type="number" />
                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Button
            mt={4}
            colorScheme='teal'
            isLoading={props.isSubmitting}
            loadingText={'Submiting'}
            type='submit'
          >
            Submit
          </Button>
</HStack>          
          
        </Form>
      )}
    </Formik><BuyMessageModal confirmation={confirmation}  setConfirmation ={setConfirmation}/></>
    
  )
}

/* 
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
                  <FormLabel id={'unique1d12323235321'}  // TODO: put a uniqueId
                  
                  htmlFor='price'>Price for listing</FormLabel>
                  <Input {...field} id='price' placeholder='Price for selling' type="number"  />
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
 */
