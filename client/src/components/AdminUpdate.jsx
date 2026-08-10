import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminUpdate() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  console.log("Validation Errors:", errors);

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data || []);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (id) => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(`/problem/problemById/${id}`);
      
      const standardLanguages = ['C++', 'Java', 'JavaScript'];

      const defaultStartCode = {
        'C++': `#include <iostream>\nusing namespace std;\n\n// Write your code here\n`,
        'Java': `public class Solution {\n    // Write your code here\n}\n`,
        'JavaScript': `// Write your code here\n`
      };

      const defaultRefSolution = {
        'C++': `#include <iostream>\nusing namespace std;\nint main() {\n    // Reference solution\n    return 0;\n}\n`,
        'Java': `public class Solution {\n    public static void main(String[] args) {\n        // Reference solution\n    }\n}\n`,
        'JavaScript': `// Reference solution\n`
      };

      // Normalize and map startCode templates
      const startCodeMap = {};
      (data.startcode || []).forEach(sc => {
        const langLower = (sc.language || '').toLowerCase();
        let targetLang = '';
        if (langLower === 'c++' || langLower === 'cpp') targetLang = 'C++';
        else if (langLower === 'java') targetLang = 'Java';
        else if (langLower === 'javascript' || langLower === 'js') targetLang = 'JavaScript';
        
        if (targetLang) {
          startCodeMap[targetLang] = sc.initalCode || '';
        }
      });

      const startCode = standardLanguages.map(lang => ({
        language: lang,
        initialCode: startCodeMap[lang] || defaultStartCode[lang]
      }));

      // Normalize and map referenceSolution code
      const refSolutionMap = {};
      (data.refrenceSolution || []).forEach(rs => {
        const langLower = (rs.language || '').toLowerCase();
        let targetLang = '';
        if (langLower === 'c++' || langLower === 'cpp') targetLang = 'C++';
        else if (langLower === 'java') targetLang = 'Java';
        else if (langLower === 'javascript' || langLower === 'js') targetLang = 'JavaScript';
        
        if (targetLang) {
          refSolutionMap[targetLang] = rs.completeCode || '';
        }
      });

      const referenceSolution = standardLanguages.map(lang => ({
        language: lang,
        completeCode: refSolutionMap[lang] || defaultRefSolution[lang]
      }));

      // Map legacy database values to Zod fields
      const formattedData = {
        title: data.title || '',
        description: data.dscription || '',
        difficulty: (data.difficultylevel || 'easy').toLowerCase(),
        tags: data.tag === 'linkedlist' ? 'linkedList' : (data.tag || 'array'),
        visibleTestCases: data.visibleTestCases || [],
        hiddenTestCases: data.hiddenTestCases || [],
        startCode,
        referenceSolution
      };

      setEditingId(id);
      reset(formattedData);
    } catch (err) {
      setError('Failed to fetch problem details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    // Map fields back to legacy database schema keys
    const payload = {
      title: data.title,
      dscription: data.description,
      difficultylevel: data.difficulty,
      tag: data.tags === 'linkedList' ? 'linkedlist' : data.tags,
      visibleTestCases: data.visibleTestCases.map(tc => ({
        input: tc.input,
        output: tc.output,
        explanation: tc.explanation
      })),
      hiddenTestCases: data.hiddenTestCases.map(tc => ({
        input: tc.input,
        output: tc.output
      })),
      startcode: data.startCode.map(sc => ({
        language: sc.language,
        initalCode: sc.initialCode
      })),
      refrenceSolution: data.referenceSolution.map(rs => ({
        language: rs.language,
        completeCode: rs.completeCode
      }))
    };

    try {
      setLoading(true);
      await axiosClient.put(`/problem/update/${editingId}`, payload);
      alert('Problem updated successfully!');
      setEditingId(null);
      fetchProblems();
    } catch (error) {
      alert(`Error updating problem: ${error.response?.data || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editingId) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4 max-w-md mx-auto">
        <div>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn btn-xs ml-4">Close</button>
        </div>
      </div>
    );
  }

  // If in list view
  if (!editingId) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Update Problems</h1>
        
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full bg-base-100 rounded-xl shadow-lg">
            <thead>
              <tr>
                <th className="w-1/12">#</th>
                <th className="w-4/12">Title</th>
                <th className="w-2/12">Difficulty</th>
                <th className="w-3/12">Tags</th>
                <th className="w-2/12 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => {
                const diff = (problem.difficultylevel || '').toLowerCase();
                return (
                  <tr key={problem._id}>
                    <th>{index + 1}</th>
                    <td className="font-semibold">{problem.title}</td>
                    <td>
                      <span className={`badge uppercase font-bold text-xs ${
                        diff === 'easy' 
                          ? 'badge-success text-white' 
                          : diff === 'medium' 
                            ? 'badge-warning text-white' 
                            : 'badge-error text-white'
                      }`}>
                        {problem.difficultylevel}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {problem.tag}
                      </span>
                    </td>
                    <td className="text-center">
                      <button 
                        onClick={() => handleEditClick(problem._id)}
                        className="btn btn-sm btn-warning text-white font-bold"
                      >
                        Edit Problem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // If in Edit mode
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Problem</h1>
        <button 
          onClick={() => setEditingId(null)}
          className="btn btn-outline"
        >
          Cancel
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <span className="loading loading-spinner text-primary">Validating and Updating...</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {Object.keys(errors).length > 0 && (
          <div className="alert alert-error shadow-lg my-4 flex flex-col items-start gap-1 p-5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
            <span className="font-bold text-base flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Please correct the following errors before submitting:
            </span>
            <ul className="list-disc pl-8 text-xs space-y-1 mt-2">
              {Object.keys(errors).map((key) => (
                <li key={key}>
                  {key === 'startCode' && 'Code Templates: Check if all 3 languages have template code.'}
                  {key === 'referenceSolution' && 'Reference Solutions: Check if all 3 languages have reference code.'}
                  {key === 'visibleTestCases' && 'Visible Test Cases: Check if at least one visible test case is added.'}
                  {key === 'hiddenTestCases' && 'Hidden Test Cases: Check if at least one hidden test case is added.'}
                  {key !== 'startCode' && key !== 'referenceSolution' && key !== 'visibleTestCases' && key !== 'hiddenTestCases' && `${key.toUpperCase()}: ${errors[key]?.message || 'Invalid value'}`}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                {...register('title')}
                className={`input input-bordered ${errors.title && 'input-error'}`}
              />
              {errors.title && (
                <span className="text-error">{errors.title.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                {...register('description')}
                className={`textarea textarea-bordered h-32 ${errors.description && 'textarea-error'}`}
              />
              {errors.description && (
                <span className="text-error">{errors.description.message}</span>
              )}
            </div>

            <div className="flex gap-4">
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Difficulty</span>
                </label>
                <select
                  {...register('difficulty')}
                  className={`select select-bordered ${errors.difficulty && 'select-error'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Tag</span>
                </label>
                <select
                  {...register('tags')}
                  className={`select select-bordered ${errors.tags && 'select-error'}`}
                >
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          
          {/* Visible Test Cases */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Visible Test Cases</h3>
              <button
                type="button"
                onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="btn btn-sm btn-primary"
              >
                Add Visible Case
              </button>
            </div>
            
            {visibleFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVisible(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>
                
                <input
                  {...register(`visibleTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />
                
                <input
                  {...register(`visibleTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
                
                <textarea
                  {...register(`visibleTestCases.${index}.explanation`)}
                  placeholder="Explanation"
                  className="textarea textarea-bordered w-full"
                />
              </div>
            ))}
          </div>

          {/* Hidden Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Hidden Test Cases</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-sm btn-primary"
              >
                Add Hidden Case
              </button>
            </div>
            
            {hiddenFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeHidden(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>
                
                <input
                  {...register(`hiddenTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />
                
                <input
                  {...register(`hiddenTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Starter Templates */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Code Templates</h2>
          <div className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-blue-500">C++ Template</span>
              </label>
              <textarea
                {...register('startCode.0.initialCode')}
                className="textarea textarea-bordered h-32 font-mono"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-amber-500">Java Template</span>
              </label>
              <textarea
                {...register('startCode.1.initialCode')}
                className="textarea textarea-bordered h-32 font-mono"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-yellow-500">JavaScript Template</span>
              </label>
              <textarea
                {...register('startCode.2.initialCode')}
                className="textarea textarea-bordered h-32 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Reference Solution */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Reference Solution</h2>
          <div className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-blue-500">C++ Reference Solution</span>
              </label>
              <textarea
                {...register('referenceSolution.0.completeCode')}
                className="textarea textarea-bordered h-32 font-mono"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-amber-500">Java Reference Solution</span>
              </label>
              <textarea
                {...register('referenceSolution.1.completeCode')}
                className="textarea textarea-bordered h-32 font-mono"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-yellow-500">JavaScript Reference Solution</span>
              </label>
              <textarea
                {...register('referenceSolution.2.completeCode')}
                className="textarea textarea-bordered h-32 font-mono"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-warning w-full text-white font-bold">
          Update Problem
        </button>
      </form>
    </div>
  );
}

export default AdminUpdate;
