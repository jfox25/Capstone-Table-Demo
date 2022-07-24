import React, {useRef, useState, useEffect} from 'react'
import styles from './Forms.module.css'
import SelectInput from './SelectInput';
import RequiredSelectInput from './RequiredSelectInput';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { motion, AnimatePresence } from 'framer-motion';
const URL = "/expenses"

const showMore = {
  hidden: {
    x: "-100%",
    opacity: 0
  },
  visable: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.1,
      type: "spring",
      damping: 25,
      stiffness: 500,
    }
  },
  exit: {
    x: "100%",
    opacity: 0
  },
};

const AddExpenseForm = ({onClose, fetchItems}) => {
    const axiosPrivate = useAxiosPrivate();
    const [categories, setCategories] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [frequents, setFrequents] = useState([]);
    const [directives, setDirectives] = useState([]);
    const [isRecurring, setIsRecurring] = useState(false);
    const[categoryId, setCategoryId] = useState(0);
    const[categoryName, setCategoryName] = useState(null);
    const[businessId, setBusinessId] = useState(0);
    const[businessName, setBusinessName] = useState(null);
    const[frequentId, setFrequentId] = useState(0);
    const costRef = useRef(0)
    const directiveRef = useRef()
    const billedEveryRef = useRef()
    const frequentNameRef = useRef()
    const dateRef = useRef()
    const [isloading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoriesHandler = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get("/categories");
                
                const transformedItems = response.data?.map(category => { return {
                        id : category.categoryId,
                        Name : category.name,
                    }
                })
                setCategories(transformedItems)
            } catch (error) {
                setError(error.message);
            }
            setIsLoading(false)
    
        }
        const fetchBusinessHandler = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get("/business");
                const transformedItems = response.data?.map(business => { return {
                        id : business.businessId,
                        Name : business.name,
                    }
                })
                setBusinesses(transformedItems)
            } catch (error) {
                setError(error.message);
            }
            setIsLoading(false)
    
        }
        const fetchDirectiveHandler = async () => {
          setIsLoading(true);
          setError(null);
          try {
              const response = await axiosPrivate.get("/directives");
              const transformedItems = response.data?.map(directive => { return {
                      id : directive.directiveId,
                      Name : directive.name,
                  }
              })
              console.log(transformedItems)
              setDirectives(transformedItems)
          } catch (error) {
              setError(error.message);
          }
          setIsLoading(false)
  
      }
        const fetchFrequentsHandler = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get("/frequents");
                const filtredData = response.data?.filter(frequent => {
                   return frequent.isRecurringExpense === false
                })
                const transformedItems = filtredData.map(frequent => { return {
                        id : frequent.frequentId,
                        Name : frequent.name,
                        Recurring: frequent.isRecurringExpense
                    }
                })
                setFrequents(transformedItems)
            } catch (error) {
                setError(error.message);
            }
            setIsLoading(false)
    
        }
        fetchCategoriesHandler();
        fetchBusinessHandler();
        fetchDirectiveHandler();
        fetchFrequentsHandler();
    }, []);
    const submitHandler = (event) => {
        event.preventDefault();
        const zero = 0;
        let expense;
        if(frequentId === zero)
        {
          expense = {
              frequentId : zero,
              categoryId : parseInt(categoryId),
              businessId : parseInt(businessId),
              businessName : businessName,
              categoryName : categoryName,
              directiveId: parseInt(directiveRef.current.value),
              date : dateRef.current.value,
              isRecurringExpense : isRecurring,
              cost : parseInt(costRef.current.value),
              billedEvery : (isRecurring)? parseInt(billedEveryRef.current.value) : 0,
              frequentName : (isRecurring)? frequentNameRef.current.value : null
          }
        } else {
          expense = {
            frequentId : parseInt(frequentId),  
            date : dateRef.current.value
        }
        }
        postExpense(expense);
    }
    const postExpense = async (expense) => {
        try {
            const response = await axiosPrivate.post(URL,
                JSON.stringify(expense ),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            fetchItems();
            onClose();
        }
        catch(error) {
            console.error(error)
        }
    }

    const onCategorySelectInputSubmitHandler = (value) => {
      console.log(value.id)
      if(value.name !== ""){
            setCategoryId(parseInt(value.id))
            setCategoryName(value.name) 
        }else {
            setCategoryId(0)
            setCategoryName(null)
        }
    }
    const onBusinessSelectInputSubmitHandler = (value) => {
        if(value.name !== "")
        {
            setBusinessId(parseInt(value.id))
            setBusinessName(value.name) 
        }else {
            setBusinessId(0)
            setBusinessName(null)
        }
    }
    const onFrequentSelectInputSubmitHandler = (value) => {
        if(value.id !== "")
        {
            setFrequentId(value.id)
        }else {
            setFrequentId(0)
        }
    }

    return (
      <>
        <h2>Add an Expense</h2>
        <form className={styles.form} onSubmit={submitHandler}>
          <RequiredSelectInput
            onSubmit={onFrequentSelectInputSubmitHandler}
            label={"Frequent"}
            items={frequents}
            isRequired={false}
          />
          <div>
                  <label htmlFor="date">Date</label>
                  <input
                  ref={dateRef}
                  id="date"
                  type="date"
                  required
                  />
            </div>
          {frequentId === 0 ? (
            <>
              <div>
                <label htmlFor="directive">Directive</label>
                <select id="directive" ref={directiveRef}>
                  {directives.map((directive) => (
                    <option
                      key={directive.id}
                      value={directive.id}
                    >
                      {directive.Name}
                    </option>
                  ))}
                </select>
              </div>
              <SelectInput
                onSubmit={onBusinessSelectInputSubmitHandler}
                label={"Business"}
                items={businesses}
                isRequired={true}
                />
                <SelectInput
                onSubmit={onCategorySelectInputSubmitHandler}
                label={"Category"}
                items={categories}
                isRequired={true}
                />
            
              <div>
                <label htmlFor="cost">Cost</label>
                <input ref={costRef} id="cost" type="number" min="0" required />
              </div>
              <div>
                <label htmlFor="isRecurring">Is Recurring Expense</label>
                <input
                  id="isRecurring"
                  onClick={() => {
                    setIsRecurring(!isRecurring);
                  }}
                  type="checkbox"
                  value={isRecurring}
                />
              </div>
              <AnimatePresence
                initial={false}
                exitBeforeEnter={true}
                onExitComplete={() => null}
              >
                {isRecurring ? (
                  <motion.div
                  variants={showMore}
                  initial="hidden"
                  animate="visable"
                  exit="exit"
                  >
                        <div>
                          <label htmlFor="billedEvery">Billed Every(Month)</label>
                          <input
                            ref={billedEveryRef}
                            id="billedEvery"
                            type="number"
                            required={isRecurring}
                          />
                        </div>
                        <div>
                          <label htmlFor="frequentName">Frequent Name</label>
                          <input
                            ref={frequentNameRef}
                            id="frequentName"
                            type="text"
                            required={isRecurring}
                          />
                        </div>
                </motion.div>
                ) : null}
              </AnimatePresence>
            </>
          ) : null}

          <button>Add Expense</button>
        </form>
      </>
    );
}

export default AddExpenseForm;