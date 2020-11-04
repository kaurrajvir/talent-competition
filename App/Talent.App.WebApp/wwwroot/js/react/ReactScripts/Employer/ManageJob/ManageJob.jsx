import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination,Card,Button,Select, Icon, Dropdown, Checkbox, Accordion, Form, Segment } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            totalItems: 2,
            currentPage: 1,
            myJobs:[],
            loadJobs: [],         
            loaderData: loader,
            oldest: true,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.onPageChange = this.onPageChange.bind(this);
        this.sortDate = this.sortDate.bind(this); 
             
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        //this.loadData(() =>
        //    this.setState({ loaderData })
        //)
        
        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.init();
        this.loadData();
        this.setState({ 
           filterOptions : [    
                { key: 'choose', value: 'choose', text: 'Choose filter' },            
                { key: 'active', value: 'active', text: 'Active' },
                { key: 'closed', value: 'closed', text: 'Closed' }               
            ],
            sortOptions : [                
                { key: 'newest', value: 'newest', text: 'Newest First' },
                { key: 'oldest', value: 'oldest', text: 'Oldest First' }               
            ]
        })
    }

    loadData(callback) {
        var link = 'https://talent-talnt.azurewebsites.net/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');  
       
        $.ajax({
            url: 'https://talent-talnt.azurewebsites.net/listing/listing/getEmployerJobs',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {               
                //console.log(res); 
                this.setState({
                    myJobs: res.myJobs,
                    loadJobs: res
                });              
            }.bind(this),
            error: function (res) {
                console.log(res.status)
            }
        })           
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }
    onPageChange(event, myJobs) {
        this.setState({
          currentPage: myJobs.activePage,
        })
    } 
    
    sortDate(event) {        
        let myJobs  = this.state.myJobs; 
        //console.log(myJobs);       
        const sortedData = myJobs.reverse(); 
        this.setState({            
            myJobs: sortedData 
        }); 
    }  

    render() { 
        let items  = this.state.myJobs; 
        let entries = this.state.totalItems;     
        this.totalpages = parseInt(items.length / entries);
        if (items.length % entries !== 0) {
        this.totalpages++;
        }     
        let skip = 0;
        skip = entries * (this.state.currentPage - 1);
        let start = skip + 1;
        let end = skip + entries;
        if (end > items.length) {
        end = items.length;
        }     
        items = items.slice(start - 1, end);  
        
        let loadJobs  = this.state; 
       console.log(loadJobs);
        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
               <div className ="ui container jobs">
                   <div className="job-card">    
                        <h2>List of Jobs</h2>                        
                        <div class="sort-filter">
                            <div class="filter">
                               <i class="filter icon"></i>Filter:  
                                <Dropdown                                                                                           
                                    options={this.state.filterOptions}                                   
                                />                              
                            </div>
                            <div class="sort">
                               <i class="calendar alternate outline icon"></i>Sort by date:
                               <Dropdown                                                            
                                    options={this.state.sortOptions}
                                    onChange={this.sortDate}
                                /> 
                            </div>
                        </div>          
                        {items && items.map((item)=> {
                            return(                                                    
                                <Card key={item.id}>
                                    <Card.Content>                                
                                        <Card.Header>{item.title}</Card.Header>
                                        <Card.Meta><i className="user icon"></i>{item.noOfSuggestions}<span className="triangle"></span></Card.Meta>
                                        <Card.Description>
                                            <span className="location">{item.location.city},{item.location.country}</span>                                            
                                            <span className="summary">{item.summary}</span>
                                        </Card.Description>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <div class="red-button">
                                            <button className="ui red button">Expired</button>
                                        </div> 
                                        <div className='ui two buttons'>                                        
                                            <Button basic color='blue'><i class="ban icon"></i>Close</Button>
                                            <Button basic color='blue'><i class="edit outline icon"></i>Edit</Button>
                                            <Button basic color='blue'><i class="copy outline icon"></i>Copy</Button>
                                        </div>
                                    </Card.Content>
                                </Card>
                            )
                        })} 
                    </div>
                    <div class="footer-nav">
                        <Pagination
                            id="pagination"
                            defaultActivePage={1}
                            totalPages={this.totalpages}
                            onPageChange={this.onPageChange}
                        /> 
                   </div>                   
               </div> 
            </BodyWrapper>
        )
    }
}