<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningResource extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'learning_plan_id',
        'quiz_question_id',
        'topic',
        'description',
        'resource_url',
        'resource_type',
        'priority',
    ];

    /**
     * Get the learning plan that the resource belongs to.
     */
    public function learningPlan(): BelongsTo
    {
        return $this->belongsTo(LearningPlan::class);
    }

    /**
     * Get the quiz question that the resource is for.
     */
    public function quizQuestion(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class);
    }
}
