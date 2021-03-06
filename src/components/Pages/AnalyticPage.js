import {useState, useEffect} from "react"
import TableControl from "../Table/TableControl"
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import  { useNavigate, useLocation } from "react-router-dom";
import Leaderboard from "../Leaderboard/Leaderboard";
import Modal from "../Modal/Modal";
import LineChart from "../Charts/LineChart";
import { AnimatePresence } from "framer-motion";
import LoadingIndicator from "../Extra/LoadingIndicator";

const AnalyticPage = () => {
    const [sortedItems, setSortedItems] = useState([]);
    const [isloading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();
    const columns = [
      { name: "Month", sortable: false },
      { name: "Top Business", sortable: true },
      {name: "Top Category", sortable: true },
      { name: "Expense Count", sortable: true },
      { name: "Total Cost", sortable: false },
    ];
    useEffect(() => {
        if(error) {
          setIsModalOpen(true);
        }else {
          setIsModalOpen(false);
        }
      }, [error])
    const decipherError = (error) => {
        if(error.response.status === 404)
        {
          setError("Unable to connect with Server. Please try again.");
        }else if(error.response.status === 401)
        {
          navigate('/login', { state : {from: location, message: "Session has expired"}, replace : true});
        }else if(error.response.data !== "") {
          setError(error.response?.data)
        }else {
          setError("Error Loading Resources")
        }
      }
    const fetchItemHandler = async () => {
        const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosPrivate.get("/analytic/generalAnalytics");
            var myData = new Map();
            for (let i = 0; i < response.data?.length; i++) {
              const item = response.data[i]
              const newItem =  {
                id : item.generalAnalyticId,
                Time : `${month[new Date(item.date).getMonth()]}, ${new Date(item.date).getFullYear()}`,
                TopBusiness : item.businessName,
                TopCategory: item.categoryName,
                ExpenseCount : item.numberOfExpenses,
                TotalCost : item.totalCostOfExpenses,
              }
              myData.set(i, newItem)
            }
            const values = [...myData.values()];
            setSortedItems(values)
        } catch (error) {
            decipherError(error)
        }
        finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        fetchItemHandler();
    }, []);
    let content = (
        <>
            <TableControl url="/analytic/generalAnalytics" columns={columns} items={sortedItems}/>
            <LineChart data ={sortedItems} title={"Analytics Visualization"}/>
            <Leaderboard items={sortedItems} />
        </>
    );
    if(isloading) {
        content = <LoadingIndicator />
    }
    return (
      <div>
        <h1 className="pageTitle">Analytics</h1>
        {content}
        <AnimatePresence
          initial={false}
          exitBeforeEnter={true}
          onExitComplete={() => null}
        >
          {isModalOpen && (
            <Modal
              isModalOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              content={
                <div className={"errorModal"}>
                  <h1>Error</h1>
                  <hr />
                  <p className={`errorDisplay`}>{error}</p>
                </div>
              }
            />
          )}
        </AnimatePresence>
      </div>
    );
}

export default AnalyticPage;