let jobData = [];
let zillowData = [];
let medianSalaryData = [];

const files = ["job_data.csv", "Zillow_data.csv", "median_salary_by_state.csv"];

const promises = files.map(file => d3.csv(file));

// Use Promise.all to handle all promises together
Promise.all(promises).then(function(values) {
    [jobData, zillowData, medianSalaryData] = values;

    console.log(jobData); //arrays
    console.log(zillowData);
    console.log(medianSalaryData);

}).catch(function(error) {
    console.error("Error loading one of the CSV files: ", error);
});
  
  // Calculate average salary based on user selections
  function calculateAverageSalary(company, jobTag, state) {
   console.log(company, jobTag, state)
    const filteredData = jobData.filter(item => 
        item.Company === company && item['Job Tag'] === jobTag && item.State === state
      );
    console.log(filteredData)

    if (filteredData.length === 0) {
        return null;
      }

    const totalSalary = filteredData.reduce((acc, cur) => {
        const salary = parseFloat(cur.Salary.replace(/[\$,]/g, ''));
        return acc + salary;
    }, 0);
    console.log(totalSalary)
    const averageSalary = filteredData.length > 0 ? totalSalary / filteredData.length : 0;
    console.log(averageSalary)
    return averageSalary;
  }
  
  // Compare salary to cost of living
  function compareSalaryToCostOfLiving(averageSalary, state) {
    const stateData = zillowData.find(item => item.State === state);
    const salaryNeeded = stateData ? stateData['Salary Needed'] : null;
    return salaryNeeded !== null ? averageSalary >= salaryNeeded : false;
  }
  
  // Function to handle calculate button click
  function onCalculateClicked() {
    const company = document.getElementById('dropdown1').value;
    const jobTag = document.getElementById('dropdown2').value;
    const state = document.getElementById('dropdown3').value;

    // Clear the previous results
    document.getElementById('medianSalaryDifference').textContent = '';
    document.getElementById('costOfLivingComparison').textContent = '';
    document.getElementById('noData').textContent = '';
    document.getElementById('averageSalaryOutput').textContent = '';
  
    const averageSalary = calculateAverageSalary(company, jobTag, state);

    if (averageSalary === null) {
        const noDataElement = document.getElementById('noData');
        noDataElement.textContent = 'No data found for the selected criteria. Cannot perform calculations.';
        return;
      }

    const medianSalaryRow = medianSalaryData.find(item => item.State === state);
    const medianSalary = parseFloat(medianSalaryRow['Median Salary'].replace(/[\$,]/g, ''));

    const salaryDifference = averageSalary === 0 ? null : averageSalary - medianSalary;

    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      });

    const averageSalaryElement = document.getElementById('averageSalaryOutput');
    averageSalaryElement.textContent = "The average salary for your selection is: " + formatter.format(averageSalary);

    const medianSalaryDifferenceElement = document.getElementById('medianSalaryDifference');
    if (salaryDifference !== null) {
      medianSalaryDifferenceElement.textContent = `The average salary of this role is ${salaryDifference >= 0 
        ? formatter.format(salaryDifference) + ' more' 
        : Math.abs(formatter.format(salaryDifference))+ ' less'} than the median salary in ` + state + ".";
    } else {
      medianSalaryDifferenceElement.textContent = 'Median salary data for the selected state is not available.';
    }

  
    const costOfLivingComparisonElement = document.getElementById('costOfLivingComparison');
    const isSalaryGreaterThanCostOfLiving = compareSalaryToCostOfLiving(averageSalary, state);
    costOfLivingComparisonElement.textContent = isSalaryGreaterThanCostOfLiving 
        ? "This salary will provide you with the recommended income needed to cover rent in" + state + "."
        : "This salary will not provide you with the recommended income needed to cover rent in" + state + "." ;
  }


  
